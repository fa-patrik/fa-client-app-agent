import { API_URL } from "config";
import Keycloak, {
  KeycloakError,
  KeycloakInstance,
  KeycloakProfile,
  KeycloakPromise,
} from "keycloak-js";
import { persistor } from "./apolloClient";
import {
  getLastUsedLinkedContact,
  isStandalone,
  setLastUsedLinkedContact,
} from "./pwa";

const FA_USER_REALM_ROLE = "FA_ADMIN";
const KEYCLOAK_WRITE_ROLES = "write-roles";
const KEYCLOAK_IMPERSONATE_ROLES = "impersonate-roles";

const getSsoRedirectUri = () => {
  const url = new URL(
    `${process.env.PUBLIC_URL}/keycloak-silent-check-sso.html`,
    window.location.origin
  );
  return url.href;
};

const keycloakInitConfig = {
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: getSsoRedirectUri(),
  pkceMethod: "S256",
} as const;

type FAKeycloakProfile = KeycloakProfile & {
  attributes?: {
    linked_contact?: string[];
  };
};

type FAKeycloakInstance = Omit<
  KeycloakInstance,
  "profile" | "loadUserProfile"
> & {
  profile?: FAKeycloakProfile;
  loadUserProfile(): KeycloakPromise<FAKeycloakProfile, void>;
};

type SubscribeFunctionType = (state: KeycloakServiceStateType) => void;

export interface KeycloakServiceStateType {
  initialized: boolean;
  authenticated: boolean;
  error?: boolean;
  linkedContact: string | undefined;
  userProfile: KeycloakProfile | undefined;
  /**Whether the app disables write actions */
  readonly: boolean;
  /**Whether the user has rights to impersonate */
  impersonating: boolean;
}

export const keycloakServiceInitialState = {
  initialized: false,
  authenticated: false,
  linkedContact: undefined,
  userProfile: undefined,
  error: undefined,
  readonly: true,
  impersonating: false,
  setLinkedContact: undefined,
};

class KeycloakService {
  keycloak;
  state: KeycloakServiceStateType = keycloakServiceInitialState;
  subscribeFunction: SubscribeFunctionType | undefined;

  constructor(instance: FAKeycloakInstance) {
    this.keycloak = instance;
    this.init();
  }

  initOffline() {
    const lastUsedLinkedContact = getLastUsedLinkedContact();
    if (isStandalone && lastUsedLinkedContact) {
      this.state = {
        ...this.state,
        initialized: true,
        authenticated: true,
        linkedContact: lastUsedLinkedContact,
      };
    } else {
      this.state = {
        ...this.state,
        error: true,
      };
    }
    this.updateState();
    const initWhenReconnect = () => {
      this.init();
      window.removeEventListener("online", initWhenReconnect);
    };
    window.addEventListener("online", initWhenReconnect);
  }

  init() {
    if (!window.navigator.onLine) {
      this.initOffline();
      return;
    }
    this.keycloak.init(keycloakInitConfig).catch((error) => {
      console.error(error);
      this.initOffline();
    });

    this.keycloak.onReady = this.onReady;
    this.keycloak.onAuthError = this.onError;
    this.keycloak.onAuthRefreshSuccess = this.onAuthRefreshSuccess;
    this.keycloak.onAuthRefreshError = this.onError;
    this.keycloak.onAuthLogout = this.onAuthLogout;
    this.keycloak.onTokenExpired = this.onTokenExpired;
  }

  subscribe(subscribeFunction: SubscribeFunctionType) {
    this.subscribeFunction = subscribeFunction;
  }

  unsubscribe() {
    this.subscribeFunction = undefined;
  }

  notifyStateChanged() {
    this.subscribeFunction?.(this.state);
  }

  onError = (errorData?: KeycloakError) => {
    console.error(errorData);
  };

  onTokenExpired = async () => {
    await this.keycloak.updateToken(5);
  };

  onAuthRefreshSuccess = async () => {
    this.updateState();
  };

  onAuthLogout = async () => {
    this.state = {
      ...keycloakServiceInitialState,
    };
    this.updateState();
    await this.keycloak.logout();
  };

  onReady = async (authenticated: boolean) => {
    if (!authenticated) {
      //redirect to login page
      this.keycloak.login();
    } else {
      try {
        const userHasWriteRole = await this.validateWriteRole();
        const userHasImpersonationRole = await this.validateImpersonateRole();
        if (!userHasWriteRole && !userHasImpersonationRole)
          throw new Error(
            "User does not have a required role. Revoking access."
          );

        this.state = {
          ...this.state,
          initialized: true,
          authenticated: authenticated,
          error: false,
          impersonating: userHasImpersonationRole,
          readonly: userHasImpersonationRole,
        };

        await this.updateLinkedContact();

        this.updateState();
      } catch (error) {
        console.error(error);
        await this.onAuthLogout(); //logout
      }
    }
  };

  async updateLinkedContact() {
    if (this.state.authenticated) {
      const profile = await this.keycloak.loadUserProfile();
      const linkedContact = await this.getContactIdFromQuery();
      if (linkedContact !== this.state.linkedContact) {
        const lastUsedLinkedContact = getLastUsedLinkedContact();
        if (linkedContact !== lastUsedLinkedContact) {
          // clear apollo's local storage cache to make sure that different contacts' data won't mix
          await persistor.purge();
        }
        setLastUsedLinkedContact(linkedContact);
        this.state = {
          ...this.state,
          linkedContact: linkedContact,
          userProfile: profile,
        };
      }
    }
    // // clear apollo's local storage cache
    // await persistor.purge();
  }

  getLinkedContactFromProfile(profile: FAKeycloakProfile) {
    return profile?.attributes?.linked_contact?.[0];
  }

  getUserProfile(profile: FAKeycloakProfile) {
    return profile?.attributes?.linked_contact?.[0];
  }

  updateState() {
    this.notifyStateChanged();
  }

  /**
   * Gets the /keycloak.json.
   * @returns parsed keycloak.json.
   */
  async getConfigFile() {
    try {
      const config = await fetch(`${process.env.PUBLIC_URL}/keycloak.json`);
      const parsedConfig = await config?.json();
      return parsedConfig;
    } catch (error) {
      console.error("Failed to get keycloak.json.");
    }
  }

  async getToken() {
    await this.keycloak.updateToken(1);
    return this.keycloak.token;
  }

  async getContactIdFromQuery() {
    try {
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
        mode: "cors",
        body: JSON.stringify({
          query: `
            query GetContactId{
              contact{
                id
              }
            }
          `,
        }),
      });

      const parsedResponse = await response.json();
      return parsedResponse?.data?.contact?.id;
    } catch {
      console.error(`Error getting contact id.`);
    }
  }

  /**
   * Checks whether the user has at least one of the
   * write role(s).
   * @returns true if user has at least one specified write role
   * OR if no write roles were configured.
   */
  async validateWriteRole() {
    try {
      const keycloakJson = await this.getConfigFile();
      const configuredRequiredRoles = keycloakJson?.[KEYCLOAK_WRITE_ROLES] as
        | Record<string, string[]>
        | undefined;

      //No configured roles -> valid
      if (!configuredRequiredRoles) return true;

      //Check whether user has a write role
      return Object.entries(configuredRequiredRoles)?.some(
        ([keycloakClient, requiredRoles]) => {
          return requiredRoles?.some((role) =>
            this.keycloak.hasResourceRole(role, keycloakClient)
          );
        }
      );
    } catch (error) {
      console.error(
        "Unable to determine required role. Check if keycloak.json is properly configured. Revoking access."
      );
    }
    return false;
  }

  /**
   * Checks whether the user has at least one of the
   * read role(s).
   * @returns true if user has at least one specified impersonation-role
   */
  async validateImpersonateRole() {
    try {
      const keycloakJson = await this.getConfigFile();
      //optional field
      const configuredImpersonationRoles = keycloakJson?.[
        KEYCLOAK_IMPERSONATE_ROLES
      ] as Record<string, string[]> | undefined;

      //FA user -> should only be able to impersonate
      if (this.keycloak.hasRealmRole(FA_USER_REALM_ROLE)) return true;

      if (configuredImpersonationRoles) {
        return Object.entries(configuredImpersonationRoles)?.some(
          ([keycloakClient, writeRoles]) => {
            return writeRoles?.some((role) =>
              this.keycloak.hasResourceRole(role, keycloakClient)
            );
          }
        );
      }
    } catch (error) {
      console.error(
        "Unable to determine write access rights. Check if keycloak.json is properly configured. Defaulting to read-only mode."
      );
    }
    return false;
  }

  /**
   * Overrides the user's linked contact in the keycloak state.
   * Useful to impersonate another contact in the app.
   * @param id the database id of the contact to set.
   */
  setLinkedContact = (id: string) => {
    if (this.state.authenticated) {
      this.state = {
        ...this.state,
        linkedContact: id,
      };
    }
    this.updateState();
  };
}

export const keycloakService = new KeycloakService(
  Keycloak(`${process.env.PUBLIC_URL}/keycloak.json`)
);
