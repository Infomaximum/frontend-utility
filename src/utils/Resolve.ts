import forEach from "lodash/forEach";
import get from "lodash/get";
import mapKeys from "lodash/mapKeys";
import merge from "lodash/merge";
import reduce from "lodash/reduce";
import { Model } from "@infomaximum/graphql-model";

/**
 * Возвращает все экспортируемые модели из файла
 * Учитывает как именованные экспорты, так и экспорты по умолчанию
 * В возвращаемом массиве моделей содержатся только уникальные модели, если одна и та же модель
 * экспортируется именованным экспортом и по умолчанию, то эта модель в массив попадет только один раз
 */
export const requireAllModels = (
  requireContext: __WebpackModuleApi.RequireContext,
) => {
  const models = reduce(
    requireContext.keys().map(requireContext),
    (acc, exports: any) => {
      forEach(exports, (exportItem) => {
        if (Model.isModel(exportItem)) {
          acc.add(exportItem);
        }
      });

      return acc;
    },
    new Set<typeof Model>(),
  );

  return Array.from(models.values());
};

/**
 * Вернет все экспортируемые значения из заданных через `require.context` файлов. Будет возвращать значения в следующем
 * приоритете:
 * 1. Если задан path, то будет пытаться вернуть значения по этому пути. Например path = `person.name`, то вернется
 * module.exports.person.name
 * 2. Если есть defaul экспорт, то вернется он
 * 3. Иначе вернутся все именованные экспорты (module.exports целиком)
 * @param {Object} requireContext
 * @param {string} path
 * @returns {*}
 */
export const requireAll = (
  requireContext: __WebpackModuleApi.RequireContext,
  path?: string,
) => {
  return reduce(
    requireContext.keys().map(requireContext),
    (acc, exports) => merge(acc, getExportValues(exports, path)),
    {},
  );
};

let requireUniqueId = 0;

/**
 * Аналогичен {@link requireAll}, за исключением того, что добавляется гарантия, что экспортируемые из разных
 * файлов module.exports не затрут значения друг у друга при мердже. Особенно полезно с логиками, т.к.
 * имена у них могут совпадать в разных файлах.
 * @param {Object} requireContext
 * @param {string} path
 * @returns {*}
 */
export const requireAllUnique = (
  requireContext: __WebpackModuleApi.RequireContext,
  path?: string,
) => {
  return reduce(
    requireContext.keys().map(requireContext),
    (acc, exports) =>
      merge(
        acc,
        mapKeys(getExportValues(exports, path), (value, key) => {
          requireUniqueId += 1;
          return `${key}?${requireUniqueId}`;
        }),
      ),
    {},
  );
};

function getExportValues(exports: any, path?: string) {
  let exportValues;
  if (path) {
    exportValues = get(exports, path);
  } else {
    exportValues = exports.default || exports;
  }
  return exportValues;
}
