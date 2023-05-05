import {
  k8sCreateResource,
  k8sDeleteResource,
  k8sGetResource,
  k8sListResource,
  k8sPatchResource,
} from '@openshift/dynamic-plugin-sdk-utils';
import { getModelRoleBinding, getModelServiceAccountName } from '~/pages/modelServing/utils';
import { K8sStatus, KnownLabels, RoleBindingKind } from '~/k8sTypes';
import { RoleBindingModel } from '~/api/models';
import {
  ProjectSharingRBType,
  ProjectSharingRoleType,
} from '~/pages/projects/projectSharing/types';
import { genRandomChars } from '~/utilities/string';

export const generateRoleBindingData = (
  rbName: string,
  dashboardNamespace: string,
  projectName: string,
): RoleBindingKind => {
  const roleBindingObject: RoleBindingKind = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: rbName,
      namespace: dashboardNamespace,
      labels: {
        [KnownLabels.DASHBOARD_RESOURCE]: 'true',
      },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'system:image-puller',
    },
    subjects: [
      {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Group',
        name: `system:serviceaccounts:${projectName}`,
      },
    ],
  };
  return roleBindingObject;
};

export const generateRoleBindingServingRuntime = (namespace: string): RoleBindingKind => {
  const name = getModelRoleBinding(namespace);
  const saName = getModelServiceAccountName(namespace);

  const roleBindingObject: RoleBindingKind = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name,
      namespace,
      labels: {
        [KnownLabels.DASHBOARD_RESOURCE]: 'true',
      },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: 'view',
    },
    subjects: [
      {
        kind: 'ServiceAccount',
        name: saName,
      },
    ],
  };
  return roleBindingObject;
};

export const generateRoleBindingProjectSharing = (
  namespace: string,
  rbSubjectType: ProjectSharingRBType,
  rbSubjectName: string,
  rbRoleRefType: ProjectSharingRoleType,
): RoleBindingKind => {
  const roleBindingObject: RoleBindingKind = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: `dashboard-permissions-${genRandomChars()}`,
      namespace,
      labels: {
        [KnownLabels.DASHBOARD_RESOURCE]: 'true',
        [KnownLabels.PROJECT_SHARING]: 'true',
      },
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: rbRoleRefType,
    },
    subjects: [
      {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: rbSubjectType,
        name: rbSubjectName,
      },
    ],
  };
  return roleBindingObject;
};

export const listRoleBindings = (
  namespace?: string,
  labelSelector?: string,
): Promise<RoleBindingKind[]> => {
  const queryOptions = {
    ...(namespace && { ns: namespace }),
    ...(labelSelector && { queryParams: { labelSelector } }),
  };
  return k8sListResource<RoleBindingKind>({
    model: RoleBindingModel,
    queryOptions,
  }).then((listResource) => listResource.items);
};

export const getRoleBinding = (projectName: string, rbName: string): Promise<RoleBindingKind> =>
  k8sGetResource({
    model: RoleBindingModel,
    queryOptions: { name: rbName, ns: projectName },
  });

export const createRoleBinding = (data: RoleBindingKind): Promise<RoleBindingKind> =>
  k8sCreateResource({ model: RoleBindingModel, resource: data });

export const deleteRoleBinding = (rbName: string, namespace: string): Promise<K8sStatus> =>
  k8sDeleteResource<RoleBindingKind, K8sStatus>({
    model: RoleBindingModel,
    queryOptions: { name: rbName, ns: namespace },
  });

export const patchRoleBindingName = (
  rbName: string,
  namespace: string,
  rbRoleRefType: ProjectSharingRoleType,
): Promise<RoleBindingKind> =>
  k8sPatchResource<RoleBindingKind>({
    model: RoleBindingModel,
    queryOptions: { name: rbName, ns: namespace },
    patches: [
      {
        op: 'replace',
        path: '/roleRef/name',
        value: rbRoleRefType,
      },
    ],
  });
