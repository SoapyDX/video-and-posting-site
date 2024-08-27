# Video Upload Platform

This is a simple web application that allows users to upload and view videos, create posts, and manage content. Admin users have the additional capability to delete posts and videos.

## Features

- **User Authentication:** Register, login, and logout.
- **Video Upload:** Upload videos which are then displayed on the site.
- **Post Creation:** Create text posts that are displayed separately from videos.
- **Admin Functions:** Admin users can delete posts and videos.
- **Responsive Layout:** Videos are displayed in a row, while posts are shown in a column.

## Requirements

To run this project locally, you will need the following:

- **Node.js:** Version 14 or later.
- **MongoDB:** A running instance of MongoDB.
- **npm or yarn:** For managing dependencies.

## Dependencies

The project requires the following npm packages:

- **express:** Web framework for Node.js.
- **mongoose:** MongoDB object modeling tool.
- **express-session:** Middleware for session management.
- **connect-mongo:** MongoDB session store for Express sessions.
- **path:** Node.js module for handling file paths.
- **multer:** Middleware for handling file uploads.
- **fs:** Node.js module for file system operations.