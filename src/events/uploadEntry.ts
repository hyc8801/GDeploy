import { Deploy } from "../deploy";
import { Dependency } from "../nodeDependencies";

/**
 * 上传事件
 * @param dependency 
 */
export const uploadEntry = (dependency: Dependency) => {
  if (!dependency) {return;}
  console.log(dependency);
  new Deploy(dependency.config, dependency.workspaceRoot);
};
