<h1 align="center">
  🐝🍯 bee app 🍯🐝
</h1>

<p align = "justify">
	:green_circle:  Honey Products Store.
</p>

## Overview
This web application showcases various honey-based products such as honey jars, lip balms, and other items made by a beekeeper. It allows users to browse through the available products and offers features for customers to be notified when out-of-stock items become available again. [Backend for this application](https://github.com/larissakoliveira/webhook-api-contentful-bees)

## Features
- **Product Catalog**: Display of products with product cards that include:
  - Product name
  - Product image
  - "More information" button that opens a modal with the product's detailed description.
- **Stock Notifications**: 
  - If a product is out of stock, a "Notify Me" button will appear. Users can enter their email address to be notified when the product is back in stock.
  - If a product is in stock, no "Notify Me" button will be displayed.
- **Multi-Language Support**: The application supports Dutch, English, Portuguese and German allowing users to switch between languages for a more personalized experience.

## Tech Stack
### Frontend:
- **React** (TypeScript) for building the user interface, ensuring type safety and smooth development experience.
- **Contentful** CMS is used to manage product data (name, description, images, and stock status) dynamically.
  
### Backend:
- **Contentful Webhook**: A webhook triggers an event when product stock status changes. This ensures that email notifications are sent as soon as the stock is updated.
- **Nodemailer**: Handles sending email notifications to users who sign up for stock updates.
#### Check out the backend project: `https://github.com/larissakoliveira/webhook-api-contentful-bees`
  
## How It Works
1. **Product Management**: The website owner can manage products directly through Contentful, including adding/removing products and updating stock status.
2. **Customer Experience**: Users can browse products and request notifications for out-of-stock items. When an item is back in stock, an email will be sent to those who signed up.
3. **Language Switching**: The website allows users to switch between different languages, providing an international user experience.

## Installation & Setup
1. Clone this repository:
2. Add .env file with the following variables:
2. Add a `.env` file with the following variables that you can find in your ContentFul settings:

| Variable Name                                    | Description                                 |
|--------------------------------------------------|---------------------------------------------|
| `VITE_CONTENTFUL_SPACE_ID`                       | Your Contentful space ID                    |
| `VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API`      | Your Contentful delivery API token (HTTP GET) API KEYS|
| `VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT`        | Your Contentful management API token (HTTP POST, DELETE, PATCH, PUT) CMA TOKENS|
| `VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID` (optional) | Product content type **API identifier**; GraphQL uses `<id>Collection`. Defaults to `product`. |

Product text in Contentful must include **Dutch and English** names and descriptions. Portuguese and German in the app (and in stock emails) **fall back to English** when not provided in the webhook payload.

   ```bash
   git clone git@github.com:devFullMates/bee-app.git
   npm install   
   npm start
