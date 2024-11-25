## Testing in Tableberg

### General

Place test files in their respective folder first by language, then by test type (`unit`, `integration`, etc.). And
finally by the workspace they belongs to and mimicking exact folder structure of the target file being tested.

`{language}/{test_type}/{workspace}/{target_file_path}`

---

### PHP

PHP tests are written using PHPUnit. Calling related composer script for the first time will handle necessary setup. For
integration tests, a copy of the `WordPress` development version will be downloaded to  `includes/integration/wp`
folder. This folder is ignored by git so will not end up in the repository. To satisfy database requirements of
integration tests, in the same folder, a `sqlite` database file will be created and used. Both base test case classes
can be found in `includes/integration` folder.
---

### JavaScript

JavaScript tests are written using Jest. Those tests can be run with appropriate npm script available in the root
workspace `package.json` file. React components are tested using `@testing-library/react`
and `@testing-library/jest-dom`.





