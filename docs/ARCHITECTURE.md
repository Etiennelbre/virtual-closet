# Virtual Closet - architecture of the prototype

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

All backend resources are in one file: `backend/template.yaml` (AWS SAM). Region `eu-north-1` (Stockholm), cost $0.

**Region and AI.** Our AWS Free plan account is locked to eu-north-1 by a rule of the account's organisation (other regions are refused). Amazon Rekognition is not offered in eu-north-1, so the Lambda runs with `USE_REKOGNITION=false`: `analysePhoto` returns a simulated result (`source: "simulated"`) and the app shows "AI: simulated". The Rekognition call is fully written and is used as soon as the backend runs in a region that has Rekognition with `USE_REKOGNITION=true`.

## Data

- **DynamoDB table "ClothesTable"**: partition key `userId`, sort key `itemId`. One row per piece of clothing: `category`, `colour`, `confidence`, `aiSource`, `photoKey`, `createdAt`.
- **S3 bucket "PhotosBucket"**: private (all public access blocked). Photos are stored as `{userId}/{itemId}.jpg`. The browser only gets **presigned links valid for 15 minutes**.

## Flow 1 - Login and an API call with the token

1. The React app shows the Amplify `<Authenticator>`. The student signs up with an email; Cognito emails a code to verify it.
2. After sign-in, Cognito gives the browser an **ID token** (a signed JWT).
3. `frontend/src/api.js` sends every request with `Authorization: Bearer <token>`.
4. API Gateway checks the token (signature, issuer = our user pool, audience = our app client). If it is not valid, the answer is **401** and the Lambda is never called.
5. The Lambda reads the user id from the checked token (`claims.sub`), never from the browser, so a user can only see their own clothes.

## Flow 2 - Add a photo

1. The student takes a photo (`capture="environment"` opens the camera on a phone).
2. The browser resizes it to max 1000 px and converts it to JPEG with a canvas (this also removes the GPS location).
3. `POST /items` with `{ imageBase64 }`. The Lambda saves the photo in S3, calls **Rekognition DetectLabels** (in this deployment: a simulated result, see above) (labels + image colours), maps the label to one of 6 categories and takes the dominant foreground colour, then saves the item in DynamoDB.
4. The app shows the photo, type, colour, confidence and the badge "AI: Rekognition" (or "AI: simulated"). The student can correct them; **Save** sends `PUT /items/{id}`.

## Flow 3 - Outfit of the day

1. The Outfit screen calls `GET /outfit?city=Dublin`.
2. The Lambda asks **Open-Meteo** for the city's position, then today's max temperature and rain chance (if it fails: 12°C, "weather unavailable").
3. It loads my clothes and runs `pickOutfit` (`backend/src/outfit.js`): a top + a bottom or a dress, plus shoes, plus outerwear if below 12°C or rain chance above 50%. Items are picked at random, so **Another one** gives a new outfit.
4. The answer `{ weather, items, explanation }` is shown; the explanation says what to add if something is missing.

## API routes

| Method and path | What it does |
| --- | --- |
| `POST /items` | Save a photo, analyse it, create the item |
| `GET /items` | My items, each with a 15-minute photo link |
| `PUT /items/{id}` | Correct category or colour |
| `DELETE /items/{id}` | Delete the item and its photo |
| `GET /outfit?city=Dublin` | Weather + outfit + explanation |

Errors are returned as `{ "error": "message" }` with a status code (400, 401, 404, 500).

## Part 2 design vs prototype

| Part 2 design | Prototype | Why |
| --- | --- | --- |
| 6 microservices (Lambda) | 1 Lambda with a router | Simpler for a 3-week demo; the code is split into modules that match the services |
| RDS PostgreSQL in a VPC + NAT gateway | DynamoDB, no VPC | $0 constraint (NAT about $35 per month) |
| S3 event + SQS queue + scan worker, rembg background removal | Photo analysed directly in the API call, no background removal | Simpler; fine for one user at a time |
| EventBridge job at 06:00 | Outfit computed when the user opens the page | Simpler; same rules |
| CloudFront + S3 for the website | Amplify Hosting | One-click hosting with HTTPS from GitHub |
| WAF, GuardDuty, Secrets Manager | Not included | Paid services; Cognito token check + private bucket kept |
| RevenueCat, SNS push, moderation, Apple / Google login | Simulated or future | Out of scope for the demo |
| OpenWeatherMap | Open-Meteo | Free, no key |
| Region eu-west-1 (Ireland), Amazon Rekognition | eu-north-1 (Stockholm), AI simulated | The AWS Free plan locks our account to Stockholm, where Rekognition does not exist |
