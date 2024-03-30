# TableBerg

Advanced Table Block for Wordpress Block Editor

## Project Setup

This project is a pnpm monorepo. You **need** to have `pnpm` installed on your system: https://pnpm.io/installation

Install dependencies: `pnpm install`.

Run project in watch mode: `pnpm start`.

Build project: `pnpm build`.

Export plugin zip: `pnpm export`.

## Rules for contributing:

### All changes must be made to the `develop` branch.

* If the changes are very small (one commit), it may be pushed directly to `develop` branch.
* If the changes are bigger, a new branch must be created and a pull request must be submitted.
  * Do not merge the branch without opening a pull request.
  * When a pull request has been merged, the branch should be deleted unless it's needed later.

* `develop` branch will represent the next release of tableberg.

### Changes should not be pushed directly to `master` branch. Instead, a pull request must be opened only from `develop` branch.

* `master` branch will represent the published version of tableberg.
* Before release, the blocks version (ones that have been updated) and the plugin version must be incremented.

### Typescript

If there are typescript errors but the changes work correctly, the changes may be pushed. Mention the typescript errors in the pr so that reviewers may try to resolve the errors before merging.

If you find that you want to use a component or function from an imported package and it does not have a type signature or the type signature is incorrect, please add the type to a file in the typedefs directory. The filename should match the package name. If you're unsure what the type should be, or have any other questions regarding this process, please create an issue with the label `typescript`.
