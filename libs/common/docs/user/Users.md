# Users, groups & permissions

Identification on the site is handled using a user, group & permission system.

## Permissions

Permissions can be granted to either users or groups. Their purpose is to designate what a user or group can or cannot do in the site.

Permissions are organised in a tree in which granting a node to a user would grant permission to that user to all children permission dependant on this node. By consequence, granting the root of the tree `perm` to a user would grant them every possible permission.

[A mock tree](../../src/mock/user/permission.mock.ts) is available in this library and is used for testing. It can be visualised as follows:

![Permission tree mock](https://user-images.githubusercontent.com/26234396/116281043-95c4e880-a789-11eb-933b-0ab2f0237ae7.png)

Permissions are annotated by their parent's label, followed by a period, followed by their own label. For example, `perm.admin.manage-groups` annotates the permission `manage-groups`, of which we know is a child of `admin`, which itself is a child of `perm`.

As an example, any user that may have been granted `perm.post.view` will implicitly have `perm.post.view.general` and `perm.post.view.subscribed`.

## Groups

Granting permissions to groups instead of individual users enables bundling permissions together and granting them to many different users at once.

A user may be part of many different groups. The permissions granted to all of these groups will apply to the user.
