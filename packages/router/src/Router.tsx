import type { CanActivateFn, Route, RouteItem, TitleOptions } from './types';
import type { RouteMatch } from 'react-router-dom';

import { isFunction, isUndefined, nth } from 'lodash';
import { matchRoutes, renderMatches, useLocation } from 'react-router-dom';

import { RouterContext } from './context';

export interface RouterProps {
  routes: RouteItem[];
  titleOptions: TitleOptions;
}

export function Router(props: RouterProps) {
  const { routes, titleOptions } = props;

  const location = useLocation();

  const matches = matchRoutes(routes, location) as any as RouteMatch<string, Route>[] | null;
  if (matches) {
    matches.forEach((matche) => {
      if (isFunction(matche.route.data)) {
        matche.route.data = matche.route.data(matche.params);
      }
    });
  }

  const element: React.ReactNode = (() => {
    if (!matches) {
      return null;
    }

    let canActivateChild: CanActivateFn[] = [];
    for (const match of matches) {
      const routeData = (match.route as Route).data;
      if (routeData && routeData.canActivate) {
        for (const canActivate of routeData.canActivate.concat(canActivateChild)) {
          const can = canActivate(match.route);
          if (can !== true) {
            return can;
          }
        }
      }
      if (routeData && routeData.canActivateChild) {
        canActivateChild = canActivateChild.concat(routeData.canActivateChild);
      }
    }

    return renderMatches(matches);
  })();

  const title: string | undefined = (() => {
    if (matches) {
      const match = nth(matches, -1);
      if (match) {
        const { title } = match.route.data ?? {};
        return isFunction(title) ? title(match.params) : title;
      }
    }
  })();
  const documentTitle = (() => {
    if (isUndefined(title)) {
      return titleOptions.default ?? '';
    } else {
      const arr = [title];
      if (titleOptions.prefix) {
        arr.unshift(titleOptions.prefix);
      }
      if (titleOptions.suffix) {
        arr.push(titleOptions.suffix);
      }
      return arr.join(titleOptions.separator ?? ' - ');
    }
  })();

  return (
    <RouterContext.Provider
      value={{
        outlet: element,
        matches,
        title,
      }}
    >
      {documentTitle && <title>{documentTitle}</title>}
      {element}
    </RouterContext.Provider>
  );
}
