/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Home` | `/Home`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Settings` | `/Settings`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Trajet` | `/Trajet`; params?: Router.UnknownInputParams; } | { pathname: `/authentication/Login`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(TabBar)'}/Home` | `/Home`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(TabBar)'}/Settings` | `/Settings`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(TabBar)'}/Trajet` | `/Trajet`; params?: Router.UnknownOutputParams; } | { pathname: `/authentication/Login`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(TabBar)'}/Home${`?${string}` | `#${string}` | ''}` | `/Home${`?${string}` | `#${string}` | ''}` | `${'/(TabBar)'}/Settings${`?${string}` | `#${string}` | ''}` | `/Settings${`?${string}` | `#${string}` | ''}` | `${'/(TabBar)'}/Trajet${`?${string}` | `#${string}` | ''}` | `/Trajet${`?${string}` | `#${string}` | ''}` | `/authentication/Login${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Home` | `/Home`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Settings` | `/Settings`; params?: Router.UnknownInputParams; } | { pathname: `${'/(TabBar)'}/Trajet` | `/Trajet`; params?: Router.UnknownInputParams; } | { pathname: `/authentication/Login`; params?: Router.UnknownInputParams; };
    }
  }
}
