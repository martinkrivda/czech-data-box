# Czech Data Box Library

⭐ Star this project on GitHub — it motivates us a lot!

A library that provides access to the Information Services Data System (ISDS) interface for third-party applications in Node.js

## Description

This library is used for basic communication with the Information System for Data Boxes [ISDS](https://mojedatovaschranka.cz/) or [ISDS test](https://czebox.cz/)

### Installation

`npm install czech-data-box`

### Basic usage

#### Connecting to a data box

```node
import ISDSBox from 'czech-data-box';

// Create an instance of the ISDSBox
const isdsBox = new ISDSBox();

// Login with username and password for production
isdsBox
  .loginWithUsernameAndPassword('login', 'heslo', true)
  .then(() => {
    console.log('Logged in with username and password for production.');
  })
  .catch((err) => {
    console.error(
      'Error logging in with username and password for production:',
      err,
    );
  });

// Login with username and password for test environment
isdsBox
  .loginWithUsernameAndPassword('login', 'heslo', false)
  .then(() => {
    console.log('Logged in with username and password for test environment.');
  })
  .catch((err) => {
    console.error(
      'Error logging in with username and password for test environment:',
      err,
    );
  });
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1. Create your feature branch: `git checkout -b Feature/my-new-feature`
2. Commit your changes: `git commit -am 'Add some feature'`
3. Push to the branch: `git push origin Feature/my-new-feature`
4. Submit a pull request :D

## Changelog

In separate file [CHANGELOG.md](CHANGELOG.md). Please [keep a CHANGELOG](https://keepachangelog.com/).

This project adheres to [Semantic Versioning](https://semver.org/).

## Credits

- [Martin Křivda](https://github.com/martinkrivda)
- [All Contributors](https://github.com/martinkrivda/czech-data-box/graphs/contributors)

## License

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.
