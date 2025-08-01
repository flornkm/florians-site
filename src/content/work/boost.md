---
title: Boost
description: Health app and hardware device.
cover: /images/boost/boost.webp
date: 02 / 2023
collaborators: Anton Stallboerger
---

# Personalizing nutrition through technology

Boost is a prototype of an innovative digital product and app that helps users track their daily nutrient intake and receive personalized recommendations based on environmental factors and activity levels.

![Boost](/images/boost/boost.webp)

## The Idea

Boost combines hardware and software to create a personalized nutrition experience. The system tracks users' daily nutrient intake and provides tailored recommendations based on factors like weather conditions and physical activity, making supplement consumption more informed and convenient.

Here's one of the 3D models we created during the prototyping process:

[@model:/models/stepper_band.stl]

## Challenge

Despite widespread supplement use, most people don't know how much they should take or which products are best for their specific needs. The market is saturated with options, creating confusion rather than clarity for consumers.

## Action

**User research**
We conducted a comprehensive survey using Airtable to understand consumer attitudes toward the nutrition industry and current supplement habits. Our research revealed that while people take supplements in various forms (pills, powders, liquids), most would prefer more convenient delivery methods like drinks or powders.

**Vertical prototyping**
We developed a hardware prototype to test functionality and user experience. After testing various motors, we selected the Nema 17 stepper motor for optimal performance. We programmed an ESP32 using Arduino IDE and created a NodeJS Express server to handle data transmission between the hardware and a quickly developed frontend.


**App development**
We designed the application to be fully functional even without hardware connection, allowing for independent testing. Starting with a comprehensive Figma prototype, we built the application using Ionic React, with a NodeJS Express backend and Prisma for database modeling. We integrated Apple HealthKit and OpenWeather API to gather user data for calculating personalized vitamin recommendations.

[@video:/videos/boost-device.mp4|autoplay|muted|loop|playsInline]

**Hardware integration**
The final hardware prototype incorporated seven stepper motors, various sensors, a circular display, and two ESP32 controllers. We designed the system to transmit and receive data via HTTP requests, prioritizing reliability and creating a realistic user experience.

## Result

Our prototype received enthusiastic feedback when showcased at the University Exhibition, with many attendees expressing interest in using both the app and device. The project's potential was further validated when we were invited to present at a Startup Accelerator.
