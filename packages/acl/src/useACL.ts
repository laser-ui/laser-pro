import { AclScope } from './acl-scope';

export const aclScope = new AclScope();
export const acl = aclScope.createAcl([]);
export const useACL = aclScope.createAclHook();
