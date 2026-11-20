// About: what is implemented, simulated or future, and who built it.
const FEATURES = [
  ['FR01', 'Account and login', 'Implemented', 'Amazon Cognito'],
  ['FR02', 'Add clothes with a photo', 'Implemented (AI simulated)', 'S3; Rekognition code ready, not available in our region'],
  ['FR03', 'Virtual closet', 'Implemented', 'Grid, filter, delete'],
  ['FR04', 'Outfit of the day', 'Implemented', 'Rules + Open-Meteo weather'],
  ['FR06', 'Privacy', 'Implemented (basic)', 'Private photos, own clothes only'],
  ['FR07', 'Friends feed', 'Simulated', 'Static sample posts'],
  ['FR05', 'Premium', 'Simulated', 'Static comparison page'],
  ['FR08', 'Moderation', 'Future', ''],
  ['FR09', 'Notifications', 'Future', ''],
  ['FR10', 'Shopping', 'Future', ''],
];

const DESIGN_VS_PROTOTYPE = [
  ['6 microservices (Lambda)', '1 Lambda with a router', 'Simpler for a 3-week demo; the code is split into modules that match the services'],
  ['RDS PostgreSQL in a VPC + NAT gateway', 'DynamoDB, no VPC', '$0 constraint (NAT about $35 per month)'],
  ['S3 event + SQS queue + scan worker, rembg background removal', 'Photo analysed directly in the API call, no background removal', 'Simpler; fine for one user at a time'],
  ['EventBridge job at 06:00', 'Outfit computed when the user opens the page', 'Simpler; same rules'],
  ['CloudFront + S3 for the website', 'Amplify Hosting', 'One-click hosting with HTTPS from GitHub'],
  ['WAF, GuardDuty, Secrets Manager', 'Not included', 'Paid services; Cognito token check + private bucket kept'],
  ['RevenueCat, SNS push, moderation, Apple / Google login', 'Simulated or future', 'Out of scope for the demo'],
  ['OpenWeatherMap', 'Open-Meteo', 'Free, no key'],
  ['Region eu-west-1 (Ireland), Amazon Rekognition', 'eu-north-1 (Stockholm), AI simulated', 'The AWS Free plan locks our account to Stockholm, where Rekognition does not exist'],
];

const TEAM = [
  ['Etienne Labarbe', 'A00133504', 'Development: template.yaml, Lambda router, login, API helper'],
  ['Olivier Dubo', 'A00133476', 'Development: Rekognition, closet functions, outfit rules, weather'],
  ['Robin Chassagne', 'A00133496', 'Development: React screens and styles'],
  ['Jack Gosger', 'A00133544', 'Deployment on AWS, submission'],
  ['Michel Melhem', 'A00132978', 'Research and testing'],
];

export default function AboutScreen({ email }) {
  return (
    <section>
      <h2>About Virtual Closet</h2>
      <p className="muted">
        Demo prototype for CSC1057 IT Architecture, Dublin City University.
      </p>

      <h3>Features</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Feature</th><th>Status</th><th>How</th></tr>
        </thead>
        <tbody>
          {FEATURES.map(([id, name, status, how]) => (
            <tr key={id}><td>{id}</td><td>{name}</td><td>{status}</td><td>{how}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>Part 2 design vs prototype</h3>
      <table>
        <thead>
          <tr><th>Part 2 design</th><th>Prototype</th><th>Why</th></tr>
        </thead>
        <tbody>
          {DESIGN_VS_PROTOTYPE.map(([design, prototype, why]) => (
            <tr key={design}><td>{design}</td><td>{prototype}</td><td>{why}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>Team</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Student no.</th><th>Role</th></tr>
        </thead>
        <tbody>
          {TEAM.map(([name, number, role]) => (
            <tr key={number}><td>{name}</td><td>{number}</td><td>{role}</td></tr>
          ))}
        </tbody>
      </table>

      <p className="muted small">
        Signed in as {email || 'unknown'} · AWS region {import.meta.env.VITE_REGION || 'eu-north-1'}
      </p>
    </section>
  );
}
