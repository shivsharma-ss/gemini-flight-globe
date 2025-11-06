<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_AVIATIONSTACK_API_KEY` in [.env.local](.env.local) to your Aviationstack API key
   - You can create a free developer account at [aviationstack.com](https://aviationstack.com/) to obtain an access key.
   - Optionally override the base URL with `VITE_AVIATIONSTACK_BASE_URL` if you are using a proxy.
3. Run the app:
   `npm run dev`

> **Note:** Flight searches work best when you supply airport IATA codes (for example `JFK` or `LHR`). City names are also supported
> but may return multiple airports depending on the location.
