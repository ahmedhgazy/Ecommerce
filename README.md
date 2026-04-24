# EStore - E-commerce Website

## Project Overview

EStore is a full-stack e-commerce website built with Angular and Firebase. It offers a wide variety of products across multiple categories, providing users with a seamless shopping experience.

## Table of Contents

1. [Demo](#demo)
2. [Features](#features)
   - [Authentication](#authentication)
   - [Product Display and Interaction](#product-display-and-interaction)
   - [Shopping Cart](#shopping-cart)
   - [User Profile](#user-profile)
   - [User Experience](#user-experience)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)

# Demo

https://exclusive-e-store.netlify.app

## Features

### Authentication

- Firebase REST API integration for login and signup using email and password
- Password reset functionality
- Google account authentication using Angular Fire

### Product Display and Interaction

- Multiple product category displays:
  - Best Selling Products
  - Flash Sales
  - Explore Our Products
  - New Arrivals
- Detailed product views
- Add products to wishlist
- Image preview modal
- Add products to cart with quantity selection
- Detailed product information with image gallery
- Image zoom on hover for enhanced detail viewing
- Load More feature for pagination
- Countdown timer for special offers

### Shopping Cart

- Real-time cart management:
  - Remove products
  - Adjust quantities
  - Automatic total price updates
- Detailed cart item information (image, price, quantity)
- Billing details form with user info and shipping address
- Option to save information for faster checkout

### User Profile

- Comprehensive user information management
- Profile details page:
  - Update name, address, zip code, birthdate
  - Custom shared input component using Angular Reactive Forms
- Orders page:
  - Table view of all placed orders
  - Order details include ID, category, quantity, shipping address, and order date
- Wishlist page for favorited items

### User Experience

- Light and dark theme support
- Internationalization (i18n) support for Arabic and English languages
- Fully responsive design for all devices (PC, mobile, tablets)
- Success messages for order placements and cart updates

## Technologies Used

- Angular v17
- Firebase
- Bootstrap 5.3
- PrimeNG
- ngx-translate
- Angular Fire
- RxJS for reactive programming

## Project Structure

The project follows best practices for Angular development:

- Utilizes shared components for improved reusability
- Adheres to the DRY (Don't Repeat Yourself) principle

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
