# TypeScript REST API Boilerplate

## FAQ

#### What the hell is `healthcheck`?

Healtcheck is an example data type to test CRUD operations. It has only one property: healtcheck (of type string).\
For more information about it, you can simply check `healthcheck.model.ts` and `healthcheck.validation.ts`

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NODE_ENV`\
`MONGO_URI`\
`MONGO_PASSWORD`\
`API_VERSION`\
`PORT`

## Tech Stack

**Language:** TypeScript\
**Server:** Node, Express\
**Database:** MongoDB\
**ORM**: Mongoose, Typegoose\
**Testing:** Jest, Supertest, ts-jest\
**Validation:** Joi\
**Other:** Docker, GitHub Actions

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

You also have the options listed below

```bash
  npm run test:watch
```

```bash
  npm run test:coverage
```

## Authors

-   [@dev-mirzabicer](https://github.com/dev-mirzabicer)

## About Author

I'm a software engineering student in Turkey. I have no actual experience of web development but I can claim that I qualify as a full-stack developer. For more information about my skills and knowledge, you can check my [LinkedIn](https://www.linkedin.com/in/mirzabicer/) profile.

## Support

For support, email mirzabicer.dev@gmail.com or message me on [LinkedIn](https://www.linkedin.com/in/mirzabicer/).

## Roadmap

-   Use docker (done ✅)

-   Use GitHub Actions (done ✅)

-   Use a better demo model than `healthcheck`

-   Use Redis with another demo model

## About This Project

I can't guarantee reliability and/or consistency of this repo. But I hope you can get some information or inspiration from this boilerplate. Feel free to use it on your projects. Credits would be appreciated.

## Run Locally

Clone the project

```bash
  git clone https://github.com/dev-mirzabicer/express-ts-rest-api
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## License

[AGPL-3.0](https://github.com/dev-mirzabicer/express-ts-rest-api/blob/master/LICENSE.md)

## Feedback

If you have any feedback, please reach out to me at mirzabicer.dev@gmail.com
