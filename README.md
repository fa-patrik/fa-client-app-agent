# FA Client Portal

Modern and responsive open source portal that allows your clients to access their investments

* Modern - fresh visual design, built using popular technologies
* Responsive - access fluently with mobile and desktop devices
* Open source - customize freely or use as-is

## Overview

Client Portal is a web application developed with [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).

### Core libraries used by the application

- [Keycloak](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) - Handles authentication against FA.
- [Apollo](https://www.apollographql.com/docs/react/get-started) - Fetches and mutates data using FA's GraphQL APIs, and caches data in the browser.
- [Tailwindcss](https://tailwindcss.com/docs/installation) - Styles the app.
- [Apexcharts](https://apexcharts.com/docs/react-charts/#) - Renders interactable charts in the app.
- [Formio](https://github.com/formio/react#readme) - Renders the UI of processes defined in FA.
- [Headlessui](https://headlessui.com/) - Supplies the app with pre-defined UI components.

### Data

The application fetches all its data from FA's GraphQL API. We recommend using [FA's GraphQL playground](https://documentation.fasolutions.com/en/graphql-api-view.html) when implementing new queries and mutations.

## Customizing

The latest standard version of FA Client Portal can be installed with a click of a button within the FA Platform itself. If you intend to run the standard version, you do not need this repository. With the standard version, you can change the logo/icon, text translations, and the "Contact info" page of the application. Follow the [instructions here](https://documentation.fasolutions.com/en/modify-fa-client-portal.html). If you need or want to make other changes, you can choose to develop and maintain a custom version of FA Client Portal by forking this repository and following the below instructions.

### Warning

Note that FA does not, in any capacity, offer support with customized versions of FA Client Portal. You will have to maintain your custom version and manually merge (if needed) any new features released in the standard FA Client Portal, yourself.

### Prerequisites

In order to customize FA Client Portal, you need the following:

* FA test environment.
* Development tools installed including git, nodejs, yarn.

### Steps

#### Fork or clone our public repository

Follow these [instructions to fork](https://support.atlassian.com/bitbucket-cloud/docs/fork-a-repository/) our [public repository](https://bitbucket.org/fasolutions-ondemand/fa-client-app/src/master/) (recommended)

*OR*

Run the following in your shell to directly clone the repository to your local

    git clone https://bitbucket.org/fasolutions-ondemand/fa-client-app.git

#### Modify the application settings to match your FA Platform test environment

We now assume the address for your FA Platform is 

https://mytestenv.fasolutions.com

#### Point the authorization towards your test environment

FA Client Portal uses Keycloak for authorization. The keycloak configuration file (*keycloak.json*) is located in the *public* directory.

Change auth-server-url to point towards your test environment.

    "auth-server-url": "https://mytestenv.fasolutions.com/auth/",

Furthermore, make sure the Keycloak client to be used is defined in the file under resource. The default setting is:
    
    "resource": "fa-clientportal",

This default setting can be used directly, since the fa-clientportal client comes preconfigured with the FA Platform.

#### CORS policy

FA Back's Graphql APIs allows connections with headers from the same origin. To bypass that, you should use a proxy server.
For local development we use http-proxy-middleware.

Change REACT_APP_API_URL in the *.env* file to point towards your test environment.

    REACT_APP_API_URL=https://mytestenv.fasolutions.com

#### Roles

Finally, to be able to login and use FA Client Portal, a user must have one of the roles specified as "write-roles" or "impersonate-roles" in the *keycloak.json* configuration file. By default, the *keycloak.json* specifies the following roles from the FA Client Portal (fa-clientportal) keycloak client:

* "write-roles": { "fa-clientportal": ["ROLE_CLIENT_ACCESS"] }
* "impersonate-roles": { "fa-clientportal": ["ROLE_IMPERSONATE"] }

Write roles give normal access to FA Client Portal, while impersonate roles force a view-only mode where a user can impersonate Contacts/other users.

Furthermore, the data a user can view and modify in the Client Portal is limited by FA Back's APIs. Therefore, a user should also have sufficient view and modification rights from the FA Back (fa-back) keycloak client. FA Back comes pre-configured with two roles that may be used out of the box:

* ROLE_CLIENT_PORTAL (view, modify, limited visibility)
* ROLE_CLIENT_PORTAL_IMPERSONATE (view)

Typically, you would combine ROLE_CLIENT_ACCESS and ROLE_CLIENT_PORTAL for a regular end-client user, and ROLE_IMPERSONATE and ROLE_CLIENT_PORTAL_IMPERSONATE for a supportive user that needs to be able to view the FA Client Portal from the perspective of an arbitrary end-client.

#### Running the application

For local development run:

  	yarn install
  	yarn start

If you need develop PWA run _`yarn run withSW`_

#### Translations

App language is taken from contact settings in FA Solutions backend. Fallback language is english, i.e. if translations
for specified language are missing, english will be used. Translation files are located in *public/locales* directory.
Every language must have its own directory. Directory name should consist of two parts:

* The language code, taken from the ISO 639-1 standard
* The country/region code, taken from the ISO 3166-1 alpha-2 standard

Seperated by dash. For example fi-FI is the name of directory for Finnish language. Some translations are taken from
backend API - transaction and order types (sell, buy, etc.) and holding types (stock, fund, bond, etc.).

#### Icons

To change the app icon, you need to change at least 4 files in the *public* directory:

* `favicon.ico` - used as the favicon in browsers.
* `logo.[extension]` (e.g., `logo.svg`) - utilized as the icon on the navbar. The logo file supports a range of common image formats, including SVG, PNG, JPEG, JPG, and GIF.
* `logo192.png` (192px x 192px) - used in PWA and as an Apple touch icon.
* `logo_maskable.png` - used in PWA.


Keep in mind that for PWA we use maskable icon (more info can be found [here](https://web.dev/maskable-icon/)), if your
do not have maskable icon please adjust *manifest.json* file. You can also add other sizes but changes in *
manifest.json*
file would be necessary. More info can be found [here](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons).
Please be aware that icons can be updated with some delay, more about updates can be
found [here](https://web.dev/manifest-updates/).

#### Colors

Adjustable colors are found in the _tailwind.config.js_ file. Currently, it is possible to change the following:

- Primary color (buttons, charts, etc)
- User avatar background color palette.

For example, to change the primary color, set the _primary_ variable to your preferred color. You
can choose from predefined color palettes. List of available palettes can be
found [here](https://tailwindcss.com/docs/customizing-colors). You can also use custom palette - more information can be
found [here](https://tailwindcss.com/docs/customizing-colors#generating-colors).

To apply color changes you must build the project (yarn build) and deploy it.

#### Contact info

You can change contact info tab content by editing *contact.html* file located in *public* directory. You can use
Tailwind classes but please be aware that to reduce bundle size Tailwind scans files for class names and generate only
css for classes that has been found (you can read more [here](https://tailwindcss.com/docs/content-configuration)), so
if you use class that hasn't been used yet, build of the app will be necessary.

## Deployment

You can deploy a custom FA Client Portal to your FA Platform environment such that the application is hosted as a part of the FA Platform. By following the below instructions, your build files will eventually be uploaded to /public/portal directly in the FA Platform. FA's server side routing makes sure incoming requests are routed properly to the /public/portal/index.html.
 
Contact FA Customer Services to set up separate test and production urls (for example https://myportal.test.com and https://myportal.com) routing to /public/portal/index.html in your test and production environments.

### Deploying to your production or test environment
* (Optional) Update the *homepage* variable in the *package.json* to the appropriate context root. The default value is "", assuming that the FA Client Portal will run at root ("/"). If you have a separate url as described above, you can leave the homepage value as is. However, it might be interesting to know that subdirectories to /public in FA Platform can be accessed directly from https://myenv.fasolutions.com/public/someSubdirectory, meaning that you hypothetically can host your client portal under the context of, for example, /public/portal. If so, you can change the homepage value to /public/portal, and after following the below steps, be able to access the app from https://myenv.fasolutions.com/public/portal. 
* Update the relevant values of the *keycloak.json* in the *public* directory. 
    * Point "auth-server-url" to the relevant FA Platform environment.
* Run  _`yarn build`_ to build the deployable version.
* Prepare the build .zip required for the next step by zipping the **content** of (not the entire) *build* directory.
* Upload the build files.
    * In the FA Platform, go to Tools → Administer → Install optional packages.
    * From under Other packages, install FA Custom Client Portal Installer Route.
    * Navigate to Tools → Administer → FA Client Portal → Upload customizations.
    * Select Customized FA Client Portal (as a ZIP file) and upload your .zip file.
* Note that it might take 5-10 minutes until the build files have been deployed.

### Notes on running multiple FA Client Portal

The above instructions only cover deploying one instance of FA Client Portal. However, it is possible to run multiple Client Portals in parallell, both in a test environment and in a production environment. This requires each build to be deployed to its own directory under /public. The default deployment process as decribed above, uploads your build files to /public/portal. However, in the case of multiple FA Client Portals, you would need to upload each FA Client Portal to its own subdirectory under /public, for example portal 1 to /public/portal1, portal 2 to /public/portal2, etc. Similarly, FA Customer Services need to set up separate urls pointing to each of the build directories.