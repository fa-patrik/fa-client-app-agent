import { API_URL } from "config";
import type { KeycloakError, KeycloakProfile } from "keycloak-js";
import Keycloak from "keycloak-js";
import { persistor } from "./apolloClient";
import {
  getLastUsedLinkedContact,
  isStandalone,
  setLastUsedLinkedContact,
} from "./pwa";

const FA_USER_REALM_ROLE = "FA_ADMIN";

const getSsoRedirectUri = () => {
  const url = new URL(
    `${import.meta.env.BASE_URL}keycloak-silent-check-sso.html`,
    window.location.origin
  );
  return url.href;
};

const keycloakInitConfig = {
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: getSsoRedirectUri(),
  pkceMethod: "S256",
} as const;

export interface Access {
  sell: boolean;
  buy: boolean;
  withdraw: boolean;
  deposit: boolean;
  impersonate: boolean;
  cancelOrder: boolean;
  switch: boolean;
  advisor: boolean;
}

type FAKeycloakProfile = KeycloakProfile & {
  attributes?: {
    linked_contact?: string[];
  };
};

type FAKeycloakInstance = Omit<Keycloak, "profile" | "loadUserProfile"> & {
  profile?: FAKeycloakProfile;
  loadUserProfile(): Promise<FAKeycloakProfile>;
};

type SubscribeFunctionType = (state: KeycloakServiceStateType) => void;

export interface KeycloakServiceStateType {
  initialized: boolean;
  authenticated: boolean;
  error?: boolean;
  /**
   * The linked contact the app applies.
   * This can be the user's linked contact OR an impersonated contact.
   */
  linkedContact: string | undefined;
  /**
   * This is the contact that the user is linked to.
   */
  trueLinkedContact: string | undefined;
  userProfile: KeycloakProfile | undefined;
  access: Access;
}

export const keycloakServiceInitialState = {
  initialized: false,
  authenticated: false,
  linkedContact: undefined,
  trueLinkedContact: undefined,
  userProfile: undefined,
  error: undefined,
  access: {
    sell: false,
    buy: false,
    withdraw: false,
    deposit: false,
    impersonate: false,
    cancelOrder: false,
    switch: false,
    advisor: false,
  },
  setLinkedContact: undefined,
};

class KeycloakService {
  keycloak;
  state: KeycloakServiceStateType = keycloakServiceInitialState;
  subscribeFunction: SubscribeFunctionType | undefined;
  private initialized = false;
  private configFileCache: Record<string, unknown> | undefined;

  constructor(instance: FAKeycloakInstance) {
    this.keycloak = instance;
  }

  ensureInit() {
    if (!this.initialized) {
      this.initialized = true;
      this.init();
    }
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
    this.keycloak.onReady = this.onReady;
    this.keycloak.onAuthError = this.onError;
    this.keycloak.onAuthRefreshSuccess = this.onAuthRefreshSuccess;
    this.keycloak.onAuthRefreshError = this.onError;
    this.keycloak.onAuthLogout = this.onAuthLogout;
    this.keycloak.onTokenExpired = this.onTokenExpired;

    const redirectUriOverride = import.meta.env.VITE_AUTH_REDIRECT_URI as
      | string
      | undefined;

    this.keycloak
      .init({
        ...keycloakInitConfig,
        ...(redirectUriOverride ? { redirectUri: redirectUriOverride } : {}),
      })
      .catch((error) => {
        console.error(error);
        this.initOffline();
      });
  }

  subscribe(subscribeFunction: SubscribeFunctionType) {
    this.ensureInit();
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
      await this.keycloak.login();
    } else {
      try {
        this.state = {
          ...this.state,
          initialized: true,
          authenticated: authenticated,
          error: false,
          access: await this.deriveAccess(),
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
          trueLinkedContact: linkedContact,
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
    if (this.configFileCache) {
      return this.configFileCache;
    }
    try {
      const config = await fetch(`${import.meta.env.BASE_URL}keycloak.json`);
      const parsedConfig = await config?.json();
      this.configFileCache = parsedConfig;
      return parsedConfig;
    } catch (_error) {
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
   * Checks whether the user has at least one of the role(s) specified in an entry in the keycloak.json.
   * @param key the key in the keycloak.json to check for roles.
   * @returns true if user has at least one specified roles.
   */
  async hasAnyRole(key: string) {
    try {
      const keycloakJson = await this.getConfigFile();
      //optional field
      const configuredRoles = keycloakJson?.[key] as
        | Record<string, string[]>
        | undefined;

      if (configuredRoles) {
        return Object.entries(configuredRoles)?.some(
          ([keycloakClient, writeRoles]) => {
            return writeRoles?.some((role) =>
              this.keycloak.hasResourceRole(role, keycloakClient)
            );
          }
        );
      }
    } catch (_error) {
      console.error(
        "Unable to determine write access rights. Check if keycloak.json is properly configured. Defaulting to read-only mode."
      );
    }
    return false;
  }

  deriveAccess = async () => {
    const isAdmin = this.keycloak.hasRealmRole(FA_USER_REALM_ROLE);
    const access: Access = {
      sell: false,
      buy: false,
      withdraw: false,
      deposit: false,
      impersonate: true,
      cancelOrder: false,
      switch: false,
      advisor: false,
    };
    if (isAdmin) {
      access.impersonate = true;
      return access;
    }
    access.buy = await this.hasAnyRole("enableBuy");
    access.sell = await this.hasAnyRole("enableSell");
    access.deposit = await this.hasAnyRole("enableDeposit");
    access.withdraw = await this.hasAnyRole("enableWithdraw");
    access.impersonate = await this.hasAnyRole("enableImpersonate");
    access.cancelOrder = await this.hasAnyRole("enableCancelOrder");
    access.switch = await this.hasAnyRole("enableSwitch");
    access.advisor = await this.hasAnyRole("enableAdvisor");
    if (Object.values(access).every((value) => value === false)) {
      throw new Error("User does not have a required role. Revoking access.");
    }
    return access;
  };

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
  new Keycloak(`${import.meta.env.BASE_URL}keycloak.json`)
);
