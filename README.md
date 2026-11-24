# Virtual Closet - demo prototype

[![CI](https://github.com/Etiennelbre/virtual-closet/actions/workflows/ci.yml/badge.svg)](https://github.com/Etiennelbre/virtual-closet/actions/workflows/ci.yml)

University project for **CSC1057 IT Architecture**, Dublin City University (Part C).

Virtual Closet helps students organise their clothes. You take a photo of a piece of clothing, the app recognises its **type and colour** with AI (Amazon Rekognition, simulated in this deployment - see below), saves it in your **virtual closet**, and suggests an **outfit for today** based on the weather.

| ID | Feature | In the prototype |
| --- | --- | --- |
| FR01 | Account and login | Implemented (Amazon Cognito) |
| FR02 | Add clothes with a photo | Implemented (S3, user can correct); AI simulated, Rekognition code ready |
| FR03 | Virtual closet | Implemented (grid, filter, delete) |
| FR04 | Outfit of the day | Implemented (rules + Open-Meteo weather) |
| FR06 | Privacy | Implemented (basic): private photos, own clothes only |
| FR07 | Friends feed | Simulated (static page) |
| FR05 | Premium | Simulated (static page) |
| FR08-FR10 | Moderation, notifications, shopping | Future |

## Architecture

```
Browser (React app hosted on AWS Amplify Hosting)
   |  login with Amazon Cognito (ready-made Authenticator screen)
   |  HTTPS + token
   v
Amazon API Gateway (HTTP API, checks the Cognito token)
   v
ONE AWS Lambda function "api" (Node.js 24, plain JavaScript)
   |-- Amazon DynamoDB  (table of clothes)
   |-- Amazon S3        (private bucket of photos)
   |-- Amazon Rekognition (type and colour; simulated, see below)
   '-- Open-Meteo API   (weather, free, no key)
```

Region: **eu-north-1** (Stockholm). Cost: **$0** (AWS Free plan). More details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

**Why Stockholm and a simulated AI?** New AWS Free plan accounts are locked to one region, and ours is eu-north-1: every other region (Ireland included) is refused. Amazon Rekognition does not exist in eu-north-1, so `USE_REKOGNITION` is `"false"` and the app shows **"AI: simulated"** (random type and colour, which the user corrects). The Rekognition code (`backend/src/rekognition.js`) is complete: deployed in a region that has Rekognition, with `USE_REKOGNITION: "true"`, it is used without any other change.

## Files

| File | What it is |
| --- | --- |
| `backend/template.yaml` | The whole AWS backend (Cognito, API Gateway, Lambda, DynamoDB, S3) |
| `backend/src/index.js` | The Lambda: a router that calls the modules below |
| `backend/src/closet.js` | Add, list, correct, delete clothes |
| `backend/src/rekognition.js` | AI: type and colour of a photo |
| `backend/src/outfit.js` | Outfit rules (pure function, tested) |
| `backend/src/weather.js` | Weather from Open-Meteo |
| `backend/test/outfit.test.js` | Tests of the outfit rules |
| `.github/workflows/ci.yml` | GitHub Actions: runs the tests and the frontend build on every push |
| `frontend/src/App.jsx` | Login screen + tab bar |
| `frontend/src/api.js` | Calls the API with the login token |
| `frontend/src/resizePhoto.js` | Makes photos smaller and removes GPS data |
| `frontend/src/screens/*.jsx` | One file per screen |
| `frontend/src/styles.css` | All the styles |

## Run locally

You need Node.js 22 or newer.

```bash
# Backend tests (outfit rules)
cd backend
npm install
npm test

# Frontend (needs the backend deployed once, see below)
cd frontend
npm install
cp .env.example .env      # then fill in the 4 values from the "sam deploy" outputs
npm run dev               # open the printed http://localhost:5173
```

The Lambda itself runs on AWS only (it needs DynamoDB and S3).

## Deploy

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. In short:

1. `aws login --region eu-north-1`, then `cd backend && sam build && sam deploy --guided` (region `eu-north-1`), then note the 4 outputs.
2. Push this repository to GitHub and connect it to **AWS Amplify Hosting** (app root: `frontend`), with the 4 `VITE_...` variables.

## Demo account

- Email: `demo-account@example.com` *(to be created after deployment)*
- Password: *(given to the examiners separately, never put in the code)*

## Team

- **Etienne Labarbe** (A00133504) - development: `template.yaml`, Lambda router, login, API helper
- **Olivier Dubo** (A00133476) - development: Rekognition, closet functions, outfit rules, weather
- **Robin Chassagne** (A00133496) - development: React screens and styles
- **Jack Gosger** (A00133544) - deployment on AWS, submission
- **Michel Melhem** (A00132978) - research and testing
