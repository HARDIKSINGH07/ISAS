// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// src/config/index.ts
import dotenv from "dotenv";
dotenv.config();
var config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET || "isas-dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
  }
};

// src/routes/index.ts
import { Router } from "express";

// src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// src/generated/client/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/client/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config2 = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../src/generated/client"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  student\n  teacher\n  admin\n}\n\nenum AttendanceStatus {\n  Present\n  Absent\n  Late\n}\n\nenum EventCategory {\n  Workshop\n  Hackathon\n  Seminar\n}\n\nmodel User {\n  userID           String   @id\n  name             String\n  email            String   @unique\n  passwordHash     String\n  role             Role\n  enrolledSubjects String[] @default([])\n  subjectsTaught   String[] @default([])\n  section          String?\n\n  isDeleted Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  attendances Attendance[] @relation("StudentAttendances")\n  assignments Assignment[] @relation("CreatorAssignments")\n  events      Event[]      @relation("AdminEvents")\n  rsvps       RSVP[]\n\n  @@map("users")\n}\n\nmodel Attendance {\n  attendanceID String           @id\n  studentID    String\n  subject      String\n  date         String // Kept as string to match frontend format (ISO)\n  status       AttendanceStatus\n  markedBy     String\n\n  isDeleted Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  student User @relation("StudentAttendances", fields: [studentID], references: [userID], onDelete: Cascade)\n\n  @@map("attendance")\n}\n\nmodel Assignment {\n  assignmentID String  @id\n  title        String\n  subject      String\n  description  String\n  deadline     String\n  completed    Boolean @default(false)\n  createdBy    String\n\n  isDeleted Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  creator   User            @relation("CreatorAssignments", fields: [createdBy], references: [userID], onDelete: Cascade)\n  checklist ChecklistItem[]\n\n  @@map("assignments")\n}\n\nmodel ChecklistItem {\n  itemID       String  @id\n  label        String\n  done         Boolean @default(false)\n  assignmentID String\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  assignment Assignment @relation(fields: [assignmentID], references: [assignmentID], onDelete: Cascade)\n\n  @@map("checklist_items")\n}\n\nmodel Event {\n  eventID          String        @id\n  title            String\n  dateTime         String\n  venue            String\n  category         EventCategory\n  description      String\n  createdByAdminID String\n  published        Boolean       @default(true)\n\n  isDeleted Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  creator User   @relation("AdminEvents", fields: [createdByAdminID], references: [userID], onDelete: Cascade)\n  rsvps   RSVP[]\n\n  @@map("events")\n}\n\nmodel RSVP {\n  userID     String\n  eventID    String\n  bookmarked Boolean @default(false)\n  attending  Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user  User  @relation(fields: [userID], references: [userID], onDelete: Cascade)\n  event Event @relation(fields: [eventID], references: [eventID], onDelete: Cascade)\n\n  @@id([userID, eventID])\n  @@map("rsvps")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config2.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"userID","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"enrolledSubjects","kind":"scalar","type":"String"},{"name":"subjectsTaught","kind":"scalar","type":"String"},{"name":"section","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"attendances","kind":"object","type":"Attendance","relationName":"StudentAttendances"},{"name":"assignments","kind":"object","type":"Assignment","relationName":"CreatorAssignments"},{"name":"events","kind":"object","type":"Event","relationName":"AdminEvents"},{"name":"rsvps","kind":"object","type":"RSVP","relationName":"RSVPToUser"}],"dbName":"users"},"Attendance":{"fields":[{"name":"attendanceID","kind":"scalar","type":"String"},{"name":"studentID","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"markedBy","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"StudentAttendances"}],"dbName":"attendance"},"Assignment":{"fields":[{"name":"assignmentID","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"deadline","kind":"scalar","type":"String"},{"name":"completed","kind":"scalar","type":"Boolean"},{"name":"createdBy","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"creator","kind":"object","type":"User","relationName":"CreatorAssignments"},{"name":"checklist","kind":"object","type":"ChecklistItem","relationName":"AssignmentToChecklistItem"}],"dbName":"assignments"},"ChecklistItem":{"fields":[{"name":"itemID","kind":"scalar","type":"String"},{"name":"label","kind":"scalar","type":"String"},{"name":"done","kind":"scalar","type":"Boolean"},{"name":"assignmentID","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"assignment","kind":"object","type":"Assignment","relationName":"AssignmentToChecklistItem"}],"dbName":"checklist_items"},"Event":{"fields":[{"name":"eventID","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"dateTime","kind":"scalar","type":"String"},{"name":"venue","kind":"scalar","type":"String"},{"name":"category","kind":"enum","type":"EventCategory"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdByAdminID","kind":"scalar","type":"String"},{"name":"published","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"creator","kind":"object","type":"User","relationName":"AdminEvents"},{"name":"rsvps","kind":"object","type":"RSVP","relationName":"EventToRSVP"}],"dbName":"events"},"RSVP":{"fields":[{"name":"userID","kind":"scalar","type":"String"},{"name":"eventID","kind":"scalar","type":"String"},{"name":"bookmarked","kind":"scalar","type":"Boolean"},{"name":"attending","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"RSVPToUser"},{"name":"event","kind":"object","type":"Event","relationName":"EventToRSVP"}],"dbName":"rsvps"}},"enums":{},"types":{}}');
config2.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","student","attendances","creator","assignment","checklist","_count","assignments","user","event","rsvps","events","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Attendance.findUnique","Attendance.findUniqueOrThrow","Attendance.findFirst","Attendance.findFirstOrThrow","Attendance.findMany","Attendance.createOne","Attendance.createMany","Attendance.createManyAndReturn","Attendance.updateOne","Attendance.updateMany","Attendance.updateManyAndReturn","Attendance.upsertOne","Attendance.deleteOne","Attendance.deleteMany","Attendance.groupBy","Attendance.aggregate","Assignment.findUnique","Assignment.findUniqueOrThrow","Assignment.findFirst","Assignment.findFirstOrThrow","Assignment.findMany","Assignment.createOne","Assignment.createMany","Assignment.createManyAndReturn","Assignment.updateOne","Assignment.updateMany","Assignment.updateManyAndReturn","Assignment.upsertOne","Assignment.deleteOne","Assignment.deleteMany","Assignment.groupBy","Assignment.aggregate","ChecklistItem.findUnique","ChecklistItem.findUniqueOrThrow","ChecklistItem.findFirst","ChecklistItem.findFirstOrThrow","ChecklistItem.findMany","ChecklistItem.createOne","ChecklistItem.createMany","ChecklistItem.createManyAndReturn","ChecklistItem.updateOne","ChecklistItem.updateMany","ChecklistItem.updateManyAndReturn","ChecklistItem.upsertOne","ChecklistItem.deleteOne","ChecklistItem.deleteMany","ChecklistItem.groupBy","ChecklistItem.aggregate","Event.findUnique","Event.findUniqueOrThrow","Event.findFirst","Event.findFirstOrThrow","Event.findMany","Event.createOne","Event.createMany","Event.createManyAndReturn","Event.updateOne","Event.updateMany","Event.updateManyAndReturn","Event.upsertOne","Event.deleteOne","Event.deleteMany","Event.groupBy","Event.aggregate","RSVP.findUnique","RSVP.findUniqueOrThrow","RSVP.findFirst","RSVP.findFirstOrThrow","RSVP.findMany","RSVP.createOne","RSVP.createMany","RSVP.createManyAndReturn","RSVP.updateOne","RSVP.updateMany","RSVP.updateManyAndReturn","RSVP.upsertOne","RSVP.deleteOne","RSVP.deleteMany","RSVP.groupBy","RSVP.aggregate","AND","OR","NOT","userID","eventID","bookmarked","attending","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","title","dateTime","venue","EventCategory","category","description","createdByAdminID","published","isDeleted","itemID","label","done","assignmentID","subject","deadline","completed","createdBy","attendanceID","studentID","date","AttendanceStatus","status","markedBy","name","email","passwordHash","Role","role","enrolledSubjects","subjectsTaught","section","has","hasEvery","hasSome","every","some","none","userID_eventID","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push"]'),
  graph: "_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_ACAJe0AA2wEAIXxAANsBACGQASAA2gEAIZUBAQDcAQAhmQEBANwBACGaAQEA3AEAIZsBAQDcAQAhnQEAAJACnQEingEBANwBACECAAAAAwAgEwAAQQAgAgAAAAMAIBMAAEEAIAMAAAAFACAaAAA6ACAbAAA_ACABAAAABQAgAQAAAAMAIAMIAACNAgAgIAAAjwIAICEAAI4CACAMdAAAtAEAMHUAAEgAEHYAALQBADB7QACmAQAhfEAApgEAIZABIAClAQAhlQEBAKQBACGZAQEApAEAIZoBAQCkAQAhmwEBAKQBACGdAQAAtQGdASKeAQEApAEAIQMAAAADACABAABHADAfAABIACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAMBQAAiwIAIAcAAIwCACB7QAAAAAF8QAAAAAGIAQEAAAABjQEBAAAAAZABIAAAAAGUAQEAAAABlQEBAAAAAZYBAQAAAAGXASAAAAABmAEBAAAAAQETAABQACAKe0AAAAABfEAAAAABiAEBAAAAAY0BAQAAAAGQASAAAAABlAEBAAAAAZUBAQAAAAGWAQEAAAABlwEgAAAAAZgBAQAAAAEBEwAAUgAwARMAAFIAMAwFAAD9AQAgBwAA_gEAIHtAANsBACF8QADbAQAhiAEBANwBACGNAQEA3AEAIZABIADaAQAhlAEBANwBACGVAQEA3AEAIZYBAQDcAQAhlwEgANoBACGYAQEA3AEAIQIAAAAJACATAABVACAKe0AA2wEAIXxAANsBACGIAQEA3AEAIY0BAQDcAQAhkAEgANoBACGUAQEA3AEAIZUBAQDcAQAhlgEBANwBACGXASAA2gEAIZgBAQDcAQAhAgAAAAcAIBMAAFcAIAIAAAAHACATAABXACADAAAACQAgGgAAUAAgGwAAVQAgAQAAAAkAIAEAAAAHACADCAAA-gEAICAAAPwBACAhAAD7AQAgDXQAALMBADB1AABeABB2AACzAQAwe0AApgEAIXxAAKYBACGIAQEApAEAIY0BAQCkAQAhkAEgAKUBACGUAQEApAEAIZUBAQCkAQAhlgEBAKQBACGXASAApQEAIZgBAQCkAQAhAwAAAAcAIAEAAF0AMB8AAF4AIAMAAAAHACABAAAIADACAAAJACABAAAADQAgAQAAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAcGAAD5AQAge0AAAAABfEAAAAABkQEBAAAAAZIBAQAAAAGTASAAAAABlAEBAAAAAQETAABmACAGe0AAAAABfEAAAAABkQEBAAAAAZIBAQAAAAGTASAAAAABlAEBAAAAAQETAABoADABEwAAaAAwBwYAAPgBACB7QADbAQAhfEAA2wEAIZEBAQDcAQAhkgEBANwBACGTASAA2gEAIZQBAQDcAQAhAgAAAA0AIBMAAGsAIAZ7QADbAQAhfEAA2wEAIZEBAQDcAQAhkgEBANwBACGTASAA2gEAIZQBAQDcAQAhAgAAAAsAIBMAAG0AIAIAAAALACATAABtACADAAAADQAgGgAAZgAgGwAAawAgAQAAAA0AIAEAAAALACADCAAA9QEAICAAAPcBACAhAAD2AQAgCXQAALIBADB1AAB0ABB2AACyAQAwe0AApgEAIXxAAKYBACGRAQEApAEAIZIBAQCkAQAhkwEgAKUBACGUAQEApAEAIQMAAAALACABAABzADAfAAB0ACADAAAACwAgAQAADAAwAgAADQAgAQAAABIAIAEAAAASACADAAAAEAAgAQAAEQAwAgAAEgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAQACABAAARADACAAASACANBQAA8wEAIAwAAPQBACB4AQAAAAF7QAAAAAF8QAAAAAGIAQEAAAABiQEBAAAAAYoBAQAAAAGMAQAAAIwBAo0BAQAAAAGOAQEAAAABjwEgAAAAAZABIAAAAAEBEwAAfAAgC3gBAAAAAXtAAAAAAXxAAAAAAYgBAQAAAAGJAQEAAAABigEBAAAAAYwBAAAAjAECjQEBAAAAAY4BAQAAAAGPASAAAAABkAEgAAAAAQETAAB-ADABEwAAfgAwDQUAAOUBACAMAADmAQAgeAEA3AEAIXtAANsBACF8QADbAQAhiAEBANwBACGJAQEA3AEAIYoBAQDcAQAhjAEAAOQBjAEijQEBANwBACGOAQEA3AEAIY8BIADaAQAhkAEgANoBACECAAAAEgAgEwAAgQEAIAt4AQDcAQAhe0AA2wEAIXxAANsBACGIAQEA3AEAIYkBAQDcAQAhigEBANwBACGMAQAA5AGMASKNAQEA3AEAIY4BAQDcAQAhjwEgANoBACGQASAA2gEAIQIAAAAQACATAACDAQAgAgAAABAAIBMAAIMBACADAAAAEgAgGgAAfAAgGwAAgQEAIAEAAAASACABAAAAEAAgAwgAAOEBACAgAADjAQAgIQAA4gEAIA50AACuAQAwdQAAigEAEHYAAK4BADB4AQCkAQAhe0AApgEAIXxAAKYBACGIAQEApAEAIYkBAQCkAQAhigEBAKQBACGMAQAArwGMASKNAQEApAEAIY4BAQCkAQAhjwEgAKUBACGQASAApQEAIQMAAAAQACABAACJAQAwHwAAigEAIAMAAAAQACABAAARADACAAASACABAAAAFgAgAQAAABYAIAMAAAAUACABAAAVADACAAAWACADAAAAFAAgAQAAFQAwAgAAFgAgAwAAABQAIAEAABUAMAIAABYAIAgKAADfAQAgCwAA4AEAIHcBAAAAAXgBAAAAAXkgAAAAAXogAAAAAXtAAAAAAXxAAAAAAQETAACSAQAgBncBAAAAAXgBAAAAAXkgAAAAAXogAAAAAXtAAAAAAXxAAAAAAQETAACUAQAwARMAAJQBADAICgAA3QEAIAsAAN4BACB3AQDcAQAheAEA3AEAIXkgANoBACF6IADaAQAhe0AA2wEAIXxAANsBACECAAAAFgAgEwAAlwEAIAZ3AQDcAQAheAEA3AEAIXkgANoBACF6IADaAQAhe0AA2wEAIXxAANsBACECAAAAFAAgEwAAmQEAIAIAAAAUACATAACZAQAgAwAAABYAIBoAAJIBACAbAACXAQAgAQAAABYAIAEAAAAUACADCAAA1wEAICAAANkBACAhAADYAQAgCXQAAKMBADB1AACgAQAQdgAAowEAMHcBAKQBACF4AQCkAQAheSAApQEAIXogAKUBACF7QACmAQAhfEAApgEAIQMAAAAUACABAACfAQAwHwAAoAEAIAMAAAAUACABAAAVADACAAAWACAJdAAAowEAMHUAAKABABB2AACjAQAwdwEApAEAIXgBAKQBACF5IAClAQAheiAApQEAIXtAAKYBACF8QACmAQAhDggAAKgBACAgAACtAQAgIQAArQEAIH0BAAAAAX4BAAAABH8BAAAABIABAQAAAAGBAQEAAAABggEBAAAAAYMBAQAAAAGEAQEArAEAIYUBAQAAAAGGAQEAAAABhwEBAAAAAQUIAACoAQAgIAAAqwEAICEAAKsBACB9IAAAAAGEASAAqgEAIQsIAACoAQAgIAAAqQEAICEAAKkBACB9QAAAAAF-QAAAAAR_QAAAAASAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAAAAABhAFAAKcBACELCAAAqAEAICAAAKkBACAhAACpAQAgfUAAAAABfkAAAAAEf0AAAAAEgAFAAAAAAYEBQAAAAAGCAUAAAAABgwFAAAAAAYQBQACnAQAhCH0CAAAAAX4CAAAABH8CAAAABIABAgAAAAGBAQIAAAABggECAAAAAYMBAgAAAAGEAQIAqAEAIQh9QAAAAAF-QAAAAAR_QAAAAASAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAAAAABhAFAAKkBACEFCAAAqAEAICAAAKsBACAhAACrAQAgfSAAAAABhAEgAKoBACECfSAAAAABhAEgAKsBACEOCAAAqAEAICAAAK0BACAhAACtAQAgfQEAAAABfgEAAAAEfwEAAAAEgAEBAAAAAYEBAQAAAAGCAQEAAAABgwEBAAAAAYQBAQCsAQAhhQEBAAAAAYYBAQAAAAGHAQEAAAABC30BAAAAAX4BAAAABH8BAAAABIABAQAAAAGBAQEAAAABggEBAAAAAYMBAQAAAAGEAQEArQEAIYUBAQAAAAGGAQEAAAABhwEBAAAAAQ50AACuAQAwdQAAigEAEHYAAK4BADB4AQCkAQAhe0AApgEAIXxAAKYBACGIAQEApAEAIYkBAQCkAQAhigEBAKQBACGMAQAArwGMASKNAQEApAEAIY4BAQCkAQAhjwEgAKUBACGQASAApQEAIQcIAACoAQAgIAAAsQEAICEAALEBACB9AAAAjAECfgAAAIwBCH8AAACMAQiEAQAAsAGMASIHCAAAqAEAICAAALEBACAhAACxAQAgfQAAAIwBAn4AAACMAQh_AAAAjAEIhAEAALABjAEiBH0AAACMAQJ-AAAAjAEIfwAAAIwBCIQBAACxAYwBIgl0AACyAQAwdQAAdAAQdgAAsgEAMHtAAKYBACF8QACmAQAhkQEBAKQBACGSAQEApAEAIZMBIAClAQAhlAEBAKQBACENdAAAswEAMHUAAF4AEHYAALMBADB7QACmAQAhfEAApgEAIYgBAQCkAQAhjQEBAKQBACGQASAApQEAIZQBAQCkAQAhlQEBAKQBACGWAQEApAEAIZcBIAClAQAhmAEBAKQBACEMdAAAtAEAMHUAAEgAEHYAALQBADB7QACmAQAhfEAApgEAIZABIAClAQAhlQEBAKQBACGZAQEApAEAIZoBAQCkAQAhmwEBAKQBACGdAQAAtQGdASKeAQEApAEAIQcIAACoAQAgIAAAtwEAICEAALcBACB9AAAAnQECfgAAAJ0BCH8AAACdAQiEAQAAtgGdASIHCAAAqAEAICAAALcBACAhAAC3AQAgfQAAAJ0BAn4AAACdAQh_AAAAnQEIhAEAALYBnQEiBH0AAACdAQJ-AAAAnQEIfwAAAJ0BCIQBAAC3AZ0BIg50AAC4AQAwdQAAMgAQdgAAuAEAMHcBAKQBACF7QACmAQAhfEAApgEAIZABIAClAQAhnwEBAKQBACGgAQEApAEAIaEBAQCkAQAhowEAALkBowEipAEAALoBACClAQAAugEAIKYBAQC7AQAhBwgAAKgBACAgAADAAQAgIQAAwAEAIH0AAACjAQJ-AAAAowEIfwAAAKMBCIQBAAC_AaMBIgR9AQAAAAWnAQEAAAABqAEBAAAABKkBAQAAAAQOCAAAvQEAICAAAL4BACAhAAC-AQAgfQEAAAABfgEAAAAFfwEAAAAFgAEBAAAAAYEBAQAAAAGCAQEAAAABgwEBAAAAAYQBAQC8AQAhhQEBAAAAAYYBAQAAAAGHAQEAAAABDggAAL0BACAgAAC-AQAgIQAAvgEAIH0BAAAAAX4BAAAABX8BAAAABYABAQAAAAGBAQEAAAABggEBAAAAAYMBAQAAAAGEAQEAvAEAIYUBAQAAAAGGAQEAAAABhwEBAAAAAQh9AgAAAAF-AgAAAAV_AgAAAAWAAQIAAAABgQECAAAAAYIBAgAAAAGDAQIAAAABhAECAL0BACELfQEAAAABfgEAAAAFfwEAAAAFgAEBAAAAAYEBAQAAAAGCAQEAAAABgwEBAAAAAYQBAQC-AQAhhQEBAAAAAYYBAQAAAAGHAQEAAAABBwgAAKgBACAgAADAAQAgIQAAwAEAIH0AAACjAQJ-AAAAowEIfwAAAKMBCIQBAAC_AaMBIgR9AAAAowECfgAAAKMBCH8AAACjAQiEAQAAwAGjASISBAAAxwEAIAkAAMgBACAMAADKAQAgDQAAyQEAIHQAAMEBADB1AAAfABB2AADBAQAwdwEAwgEAIXtAAMYBACF8QADGAQAhkAEgAMUBACGfAQEAwgEAIaABAQDCAQAhoQEBAMIBACGjAQAAwwGjASKkAQAAugEAIKUBAAC6AQAgpgEBAMQBACELfQEAAAABfgEAAAAEfwEAAAAEgAEBAAAAAYEBAQAAAAGCAQEAAAABgwEBAAAAAYQBAQCtAQAhhQEBAAAAAYYBAQAAAAGHAQEAAAABBH0AAACjAQJ-AAAAowEIfwAAAKMBCIQBAADAAaMBIgt9AQAAAAF-AQAAAAV_AQAAAAWAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAAAABhAEBAL4BACGFAQEAAAABhgEBAAAAAYcBAQAAAAECfSAAAAABhAEgAKsBACEIfUAAAAABfkAAAAAEf0AAAAAEgAFAAAAAAYEBQAAAAAGCAUAAAAABgwFAAAAAAYQBQACpAQAhA6oBAAADACCrAQAAAwAgrAEAAAMAIAOqAQAABwAgqwEAAAcAIKwBAAAHACADqgEAABAAIKsBAAAQACCsAQAAEAAgA6oBAAAUACCrAQAAFAAgrAEAABQAIAJ3AQAAAAF4AQAAAAELCgAAzQEAIAsAAM4BACB0AADMAQAwdQAAFAAQdgAAzAEAMHcBAMIBACF4AQDCAQAheSAAxQEAIXogAMUBACF7QADGAQAhfEAAxgEAIRQEAADHAQAgCQAAyAEAIAwAAMoBACANAADJAQAgdAAAwQEAMHUAAB8AEHYAAMEBADB3AQDCAQAhe0AAxgEAIXxAAMYBACGQASAAxQEAIZ8BAQDCAQAhoAEBAMIBACGhAQEAwgEAIaMBAADDAaMBIqQBAAC6AQAgpQEAALoBACCmAQEAxAEAIa4BAAAfACCvAQAAHwAgEgUAAM0BACAMAADKAQAgdAAAzwEAMHUAABAAEHYAAM8BADB4AQDCAQAhe0AAxgEAIXxAAMYBACGIAQEAwgEAIYkBAQDCAQAhigEBAMIBACGMAQAA0AGMASKNAQEAwgEAIY4BAQDCAQAhjwEgAMUBACGQASAAxQEAIa4BAAAQACCvAQAAEAAgEAUAAM0BACAMAADKAQAgdAAAzwEAMHUAABAAEHYAAM8BADB4AQDCAQAhe0AAxgEAIXxAAMYBACGIAQEAwgEAIYkBAQDCAQAhigEBAMIBACGMAQAA0AGMASKNAQEAwgEAIY4BAQDCAQAhjwEgAMUBACGQASAAxQEAIQR9AAAAjAECfgAAAIwBCH8AAACMAQiEAQAAsQGMASIKBgAA0gEAIHQAANEBADB1AAALABB2AADRAQAwe0AAxgEAIXxAAMYBACGRAQEAwgEAIZIBAQDCAQAhkwEgAMUBACGUAQEAwgEAIREFAADNAQAgBwAA1AEAIHQAANMBADB1AAAHABB2AADTAQAwe0AAxgEAIXxAAMYBACGIAQEAwgEAIY0BAQDCAQAhkAEgAMUBACGUAQEAwgEAIZUBAQDCAQAhlgEBAMIBACGXASAAxQEAIZgBAQDCAQAhrgEAAAcAIK8BAAAHACAPBQAAzQEAIAcAANQBACB0AADTAQAwdQAABwAQdgAA0wEAMHtAAMYBACF8QADGAQAhiAEBAMIBACGNAQEAwgEAIZABIADFAQAhlAEBAMIBACGVAQEAwgEAIZYBAQDCAQAhlwEgAMUBACGYAQEAwgEAIQOqAQAACwAgqwEAAAsAIKwBAAALACANAwAAzQEAIHQAANUBADB1AAADABB2AADVAQAwe0AAxgEAIXxAAMYBACGQASAAxQEAIZUBAQDCAQAhmQEBAMIBACGaAQEAwgEAIZsBAQDCAQAhnQEAANYBnQEingEBAMIBACEEfQAAAJ0BAn4AAACdAQh_AAAAnQEIhAEAALcBnQEiAAAAAbMBIAAAAAEBswFAAAAAAQGzAQEAAAABBRoAAPYCACAbAAD8AgAgsAEAAPcCACCxAQAA-wIAILYBAAABACAFGgAA9AIAIBsAAPkCACCwAQAA9QIAILEBAAD4AgAgtgEAABIAIAMaAAD2AgAgsAEAAPcCACC2AQAAAQAgAxoAAPQCACCwAQAA9QIAILYBAAASACAAAAABswEAAACMAQIFGgAA7gIAIBsAAPICACCwAQAA7wIAILEBAADxAgAgtgEAAAEAIAsaAADnAQAwGwAA7AEAMLABAADoAQAwsQEAAOkBADCyAQAA6gEAILMBAADrAQAwtAEAAOsBADC1AQAA6wEAMLYBAADrAQAwtwEAAO0BADC4AQAA7gEAMAYKAADfAQAgdwEAAAABeSAAAAABeiAAAAABe0AAAAABfEAAAAABAgAAABYAIBoAAPIBACADAAAAFgAgGgAA8gEAIBsAAPEBACABEwAA8AIAMAwKAADNAQAgCwAAzgEAIHQAAMwBADB1AAAUABB2AADMAQAwdwEAwgEAIXgBAMIBACF5IADFAQAheiAAxQEAIXtAAMYBACF8QADGAQAhrQEAAMsBACACAAAAFgAgEwAA8QEAIAIAAADvAQAgEwAA8AEAIAl0AADuAQAwdQAA7wEAEHYAAO4BADB3AQDCAQAheAEAwgEAIXkgAMUBACF6IADFAQAhe0AAxgEAIXxAAMYBACEJdAAA7gEAMHUAAO8BABB2AADuAQAwdwEAwgEAIXgBAMIBACF5IADFAQAheiAAxQEAIXtAAMYBACF8QADGAQAhBXcBANwBACF5IADaAQAheiAA2gEAIXtAANsBACF8QADbAQAhBgoAAN0BACB3AQDcAQAheSAA2gEAIXogANoBACF7QADbAQAhfEAA2wEAIQYKAADfAQAgdwEAAAABeSAAAAABeiAAAAABe0AAAAABfEAAAAABAxoAAO4CACCwAQAA7wIAILYBAAABACAEGgAA5wEAMLABAADoAQAwsgEAAOoBACC2AQAA6wEAMAAAAAUaAADpAgAgGwAA7AIAILABAADqAgAgsQEAAOsCACC2AQAACQAgAxoAAOkCACCwAQAA6gIAILYBAAAJACAAAAAFGgAA4wIAIBsAAOcCACCwAQAA5AIAILEBAADmAgAgtgEAAAEAIAsaAAD_AQAwGwAAhAIAMLABAACAAgAwsQEAAIECADCyAQAAggIAILMBAACDAgAwtAEAAIMCADC1AQAAgwIAMLYBAACDAgAwtwEAAIUCADC4AQAAhgIAMAV7QAAAAAF8QAAAAAGRAQEAAAABkgEBAAAAAZMBIAAAAAECAAAADQAgGgAAigIAIAMAAAANACAaAACKAgAgGwAAiQIAIAETAADlAgAwCgYAANIBACB0AADRAQAwdQAACwAQdgAA0QEAMHtAAMYBACF8QADGAQAhkQEBAAAAAZIBAQDCAQAhkwEgAMUBACGUAQEAwgEAIQIAAAANACATAACJAgAgAgAAAIcCACATAACIAgAgCXQAAIYCADB1AACHAgAQdgAAhgIAMHtAAMYBACF8QADGAQAhkQEBAMIBACGSAQEAwgEAIZMBIADFAQAhlAEBAMIBACEJdAAAhgIAMHUAAIcCABB2AACGAgAwe0AAxgEAIXxAAMYBACGRAQEAwgEAIZIBAQDCAQAhkwEgAMUBACGUAQEAwgEAIQV7QADbAQAhfEAA2wEAIZEBAQDcAQAhkgEBANwBACGTASAA2gEAIQV7QADbAQAhfEAA2wEAIZEBAQDcAQAhkgEBANwBACGTASAA2gEAIQV7QAAAAAF8QAAAAAGRAQEAAAABkgEBAAAAAZMBIAAAAAEDGgAA4wIAILABAADkAgAgtgEAAAEAIAQaAAD_AQAwsAEAAIACADCyAQAAggIAILYBAACDAgAwAAAAAbMBAAAAnQECBRoAAN4CACAbAADhAgAgsAEAAN8CACCxAQAA4AIAILYBAAABACADGgAA3gIAILABAADfAgAgtgEAAAEAIAAAAAABswEAAACjAQICswEBAAAABLkBAQAAAAUCswEBAAAABLkBAQAAAAUBswEBAAAAAQsaAADAAgAwGwAAxQIAMLABAADBAgAwsQEAAMICADCyAQAAwwIAILMBAADEAgAwtAEAAMQCADC1AQAAxAIAMLYBAADEAgAwtwEAAMYCADC4AQAAxwIAMAsaAAC0AgAwGwAAuQIAMLABAAC1AgAwsQEAALYCADCyAQAAtwIAILMBAAC4AgAwtAEAALgCADC1AQAAuAIAMLYBAAC4AgAwtwEAALoCADC4AQAAuwIAMAsaAACoAgAwGwAArQIAMLABAACpAgAwsQEAAKoCADCyAQAAqwIAILMBAACsAgAwtAEAAKwCADC1AQAArAIAMLYBAACsAgAwtwEAAK4CADC4AQAArwIAMAsaAACfAgAwGwAAowIAMLABAACgAgAwsQEAAKECADCyAQAAogIAILMBAADrAQAwtAEAAOsBADC1AQAA6wEAMLYBAADrAQAwtwEAAKQCADC4AQAA7gEAMAYLAADgAQAgeAEAAAABeSAAAAABeiAAAAABe0AAAAABfEAAAAABAgAAABYAIBoAAKcCACADAAAAFgAgGgAApwIAIBsAAKYCACABEwAA3QIAMAIAAAAWACATAACmAgAgAgAAAO8BACATAAClAgAgBXgBANwBACF5IADaAQAheiAA2gEAIXtAANsBACF8QADbAQAhBgsAAN4BACB4AQDcAQAheSAA2gEAIXogANoBACF7QADbAQAhfEAA2wEAIQYLAADgAQAgeAEAAAABeSAAAAABeiAAAAABe0AAAAABfEAAAAABCwwAAPQBACB4AQAAAAF7QAAAAAF8QAAAAAGIAQEAAAABiQEBAAAAAYoBAQAAAAGMAQAAAIwBAo0BAQAAAAGPASAAAAABkAEgAAAAAQIAAAASACAaAACzAgAgAwAAABIAIBoAALMCACAbAACyAgAgARMAANwCADAQBQAAzQEAIAwAAMoBACB0AADPAQAwdQAAEAAQdgAAzwEAMHgBAAAAAXtAAMYBACF8QADGAQAhiAEBAMIBACGJAQEAwgEAIYoBAQDCAQAhjAEAANABjAEijQEBAMIBACGOAQEAwgEAIY8BIADFAQAhkAEgAMUBACECAAAAEgAgEwAAsgIAIAIAAACwAgAgEwAAsQIAIA50AACvAgAwdQAAsAIAEHYAAK8CADB4AQDCAQAhe0AAxgEAIXxAAMYBACGIAQEAwgEAIYkBAQDCAQAhigEBAMIBACGMAQAA0AGMASKNAQEAwgEAIY4BAQDCAQAhjwEgAMUBACGQASAAxQEAIQ50AACvAgAwdQAAsAIAEHYAAK8CADB4AQDCAQAhe0AAxgEAIXxAAMYBACGIAQEAwgEAIYkBAQDCAQAhigEBAMIBACGMAQAA0AGMASKNAQEAwgEAIY4BAQDCAQAhjwEgAMUBACGQASAAxQEAIQp4AQDcAQAhe0AA2wEAIXxAANsBACGIAQEA3AEAIYkBAQDcAQAhigEBANwBACGMAQAA5AGMASKNAQEA3AEAIY8BIADaAQAhkAEgANoBACELDAAA5gEAIHgBANwBACF7QADbAQAhfEAA2wEAIYgBAQDcAQAhiQEBANwBACGKAQEA3AEAIYwBAADkAYwBIo0BAQDcAQAhjwEgANoBACGQASAA2gEAIQsMAAD0AQAgeAEAAAABe0AAAAABfEAAAAABiAEBAAAAAYkBAQAAAAGKAQEAAAABjAEAAACMAQKNAQEAAAABjwEgAAAAAZABIAAAAAEKBwAAjAIAIHtAAAAAAXxAAAAAAYgBAQAAAAGNAQEAAAABkAEgAAAAAZQBAQAAAAGVAQEAAAABlgEBAAAAAZcBIAAAAAECAAAACQAgGgAAvwIAIAMAAAAJACAaAAC_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-WRo_WgNAWwNBXApCXxtDYB9EYQRFYgRGYwRHZARIZQRJZwRKaQpLaiBMbARNbgpObyFPcARQcQRRcgpSdSJTdiZUdwZVeAZWeQZXegZYewZZfQZafwpbgAEnXIIBBl2EAQpehQEoX4YBBmCHAQZhiAEKYosBKWOMAS1kjQEHZY4BB2aPAQdnkAEHaJEBB2mTAQdqlQEKa5YBLmyYAQdtmgEKbpsBL2-cAQdwnQEHcZ4BCnKhATBzogE0"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config2.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config2);
}

// src/generated/client/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/client/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/repositories/prisma/prismaClient.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var adapter = new PrismaPg(pool);
var globalForPrisma = global;
var prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/repositories/prisma/PrismaUserRepository.ts
var PrismaUserRepository = class {
  async findByEmail(email) {
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        isDeleted: false
      }
    });
    return user;
  }
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { userID: id, isDeleted: false }
    });
    return user;
  }
  async findAll() {
    const users2 = await prisma.user.findMany({
      where: { isDeleted: false }
    });
    return users2;
  }
  async findByRole(role) {
    const users2 = await prisma.user.findMany({
      where: { role, isDeleted: false }
    });
    return users2;
  }
};

// src/repositories/prisma/PrismaAttendanceRepository.ts
var PrismaAttendanceRepository = class {
  async findByStudent(studentID) {
    const records = await prisma.attendance.findMany({
      where: { studentID, isDeleted: false }
    });
    return records;
  }
  async findBySubject(subject) {
    const records = await prisma.attendance.findMany({
      where: { subject, isDeleted: false }
    });
    return records;
  }
  async findByStudentAndSubject(studentID, subject) {
    const records = await prisma.attendance.findMany({
      where: { studentID, subject, isDeleted: false }
    });
    return records;
  }
  async create(attendance2) {
    const record = await prisma.attendance.create({
      data: attendance2
    });
    return record;
  }
  async update(attendanceID, updates) {
    try {
      const record = await prisma.attendance.update({
        where: { attendanceID },
        data: updates
      });
      return record;
    } catch {
      return null;
    }
  }
  async findAll() {
    const records = await prisma.attendance.findMany({
      where: { isDeleted: false }
    });
    return records;
  }
  async findByStudentSubjectAndDate(studentID, subject, dateStr) {
    const records = await prisma.attendance.findMany({
      where: { studentID, subject, isDeleted: false }
    });
    const dStr = new Date(dateStr).toDateString();
    const match = records.find((r) => new Date(r.date).toDateString() === dStr);
    return match ? match : null;
  }
};

// src/repositories/prisma/PrismaAssignmentRepository.ts
var PrismaAssignmentRepository = class {
  async findById(id) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignmentID: id, isDeleted: false },
      include: { checklist: true }
    });
    return assignment;
  }
  async findByCreator(creatorID) {
    const assignments = await prisma.assignment.findMany({
      where: { createdBy: creatorID, isDeleted: false },
      include: { checklist: true }
    });
    return assignments;
  }
  async findAll() {
    const assignments = await prisma.assignment.findMany({
      where: { isDeleted: false },
      include: { checklist: true },
      orderBy: { deadline: "asc" }
    });
    return assignments;
  }
  async create(record) {
    const { checklist, ...data } = record;
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        checklist: {
          create: checklist.map((c) => ({
            itemID: c.itemID,
            label: c.label,
            done: c.done
          }))
        }
      },
      include: { checklist: true }
    });
    return assignment;
  }
  async update(id, updates) {
    try {
      const { checklist, ...data } = updates;
      const assignment = await prisma.assignment.update({
        where: { assignmentID: id },
        data: {
          ...data,
          ...checklist && {
            checklist: {
              deleteMany: {},
              create: checklist.map((c) => ({
                itemID: c.itemID,
                label: c.label,
                done: c.done
              }))
            }
          }
        },
        include: { checklist: true }
      });
      return assignment;
    } catch {
      return null;
    }
  }
  async delete(id) {
    try {
      await prisma.assignment.update({
        where: { assignmentID: id },
        data: { isDeleted: true }
      });
      return true;
    } catch {
      return false;
    }
  }
};

// src/repositories/prisma/PrismaEventRepository.ts
var PrismaEventRepository = class {
  async findById(id) {
    const event = await prisma.event.findUnique({
      where: { eventID: id, isDeleted: false }
    });
    return event;
  }
  async findAll() {
    const events = await prisma.event.findMany({
      where: { isDeleted: false },
      orderBy: { dateTime: "asc" }
    });
    return events;
  }
  async findPublished() {
    const events = await prisma.event.findMany({
      where: { published: true, isDeleted: false },
      orderBy: { dateTime: "asc" }
    });
    return events;
  }
  async create(record) {
    const event = await prisma.event.create({
      data: record
    });
    return event;
  }
  async update(id, updates) {
    try {
      const event = await prisma.event.update({
        where: { eventID: id },
        data: updates
      });
      return event;
    } catch {
      return null;
    }
  }
  async delete(id) {
    try {
      await prisma.event.update({
        where: { eventID: id },
        data: { isDeleted: true }
      });
      return true;
    } catch {
      return false;
    }
  }
};

// src/repositories/prisma/PrismaRsvpRepository.ts
var PrismaRsvpRepository = class {
  async findByUserAndEvent(userID, eventID) {
    const rsvp = await prisma.rSVP.findUnique({
      where: {
        userID_eventID: { userID, eventID }
      }
    });
    return rsvp;
  }
  async findByUser(userID) {
    const rsvps = await prisma.rSVP.findMany({
      where: { userID }
    });
    return rsvps;
  }
  async create(record) {
    const rsvp = await prisma.rSVP.create({
      data: record
    });
    return rsvp;
  }
  async update(userID, eventID, updates) {
    try {
      const rsvp = await prisma.rSVP.update({
        where: {
          userID_eventID: { userID, eventID }
        },
        data: updates
      });
      return rsvp;
    } catch {
      return null;
    }
  }
};

// src/repositories/index.ts
var repositories = {
  users: new PrismaUserRepository(),
  attendance: new PrismaAttendanceRepository(),
  assignments: new PrismaAssignmentRepository(),
  events: new PrismaEventRepository(),
  rsvps: new PrismaRsvpRepository()
};

// src/services/auth.service.ts
var AuthService = class {
  userRepo = repositories.users;
  async login(email, passwordPlain, role) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.role !== role) {
      return null;
    }
    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      return null;
    }
    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    const { passwordHash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
};
var authService = new AuthService();

// src/controllers/auth.controller.ts
var login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);
    if (!result) {
      return res.status(401).json({ error: "Invalid credentials or role" });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};
var getMe = async (req, res, next) => {
  try {
    const user = await repositories.users.findById(req.user.userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// src/utils/index.ts
import { v4 as uuidv4 } from "uuid";
var generateId = (prefix) => `${prefix}_${uuidv4().replace(/-/g, "")}`;

// src/seed/index.ts
import bcrypt2 from "bcryptjs";
var SUBJECTS = [
  "Data Structures",
  "Operating Systems",
  "Database Systems",
  "Computer Networks",
  "Web Engineering"
];
var SECTIONS = ["CS-3A", "CS-3B"];
var hash = (pass) => bcrypt2.hashSync(pass, 10);
var users = [
  {
    userID: "s1",
    name: "Aarav Mehta",
    email: "aarav@student.isas.edu",
    passwordHash: hash("student123"),
    role: "student",
    section: "CS-3A",
    enrolledSubjects: SUBJECTS
  },
  {
    userID: "t1",
    name: "Dr. Neha Kapoor",
    email: "neha@faculty.isas.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    subjectsTaught: ["Data Structures", "Operating Systems"]
  },
  {
    userID: "a1",
    name: "Rohan Verma",
    email: "rohan@admin.isas.edu",
    passwordHash: hash("admin123"),
    role: "admin"
  }
];
var roster = [
  { studentID: "s1", name: "Aarav Mehta", section: "CS-3A" },
  { studentID: "s2", name: "Diya Sharma", section: "CS-3A" },
  { studentID: "s3", name: "Kabir Singh", section: "CS-3A" },
  { studentID: "s4", name: "Isha Nair", section: "CS-3B" },
  { studentID: "s5", name: "Vivaan Rao", section: "CS-3B" },
  { studentID: "s6", name: "Anaya Gupta", section: "CS-3B" }
];
function seedAttendance() {
  const out = [];
  let id = 0;
  const today = /* @__PURE__ */ new Date("2026-07-13");
  SUBJECTS.forEach((subject, sIdx) => {
    const total = 20;
    const absentEvery = sIdx === 0 ? 3 : sIdx === 1 ? 6 : 8;
    for (let i = total; i > 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 2);
      let status = "Present";
      if (i % absentEvery === 0) status = "Absent";
      else if (i % 5 === 0) status = "Late";
      out.push({
        attendanceID: `att${id++}`,
        studentID: "s1",
        subject,
        date: d.toISOString(),
        status,
        markedBy: "s1"
      });
    }
  });
  ["Data Structures", "Operating Systems"].forEach((subject) => {
    roster.forEach((r, ri) => {
      if (r.studentID === "s1") return;
      const total = 20;
      const absentEvery = 2 + ri % 4;
      for (let i = total; i > 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 2);
        let status = "Present";
        if (i % absentEvery === 0) status = "Absent";
        else if (i % 6 === 0) status = "Late";
        out.push({
          attendanceID: `att${id++}`,
          studentID: r.studentID,
          subject,
          date: d.toISOString(),
          status,
          markedBy: "t1"
        });
      }
    });
  });
  return out;
}
var attendance = seedAttendance();

// src/services/attendance.service.ts
var AttendanceService = class {
  attRepo = repositories.attendance;
  async logAttendance(studentID, subject, status, markedBy) {
    return await this.attRepo.create({
      attendanceID: generateId("att"),
      studentID,
      subject,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      status,
      markedBy
    });
  }
  async setStudentStatus(studentID, subject, status, markedBy) {
    const today = (/* @__PURE__ */ new Date()).toISOString();
    const existing = await this.attRepo.findByStudentSubjectAndDate(studentID, subject, today);
    if (existing) {
      return await this.attRepo.update(existing.attendanceID, { status, markedBy });
    }
    return await this.attRepo.create({
      attendanceID: generateId("att"),
      studentID,
      subject,
      date: today,
      status,
      markedBy
    });
  }
  async getAttendancePercent(studentID, subject) {
    let recs = await this.attRepo.findByStudent(studentID);
    if (subject) {
      recs = recs.filter((a) => a.subject === subject);
    }
    if (!recs.length) return 100;
    const attended = recs.filter((a) => a.status !== "Absent").length;
    return Math.round(attended / recs.length * 100);
  }
  async getSubjectStats(studentID) {
    const recs = await this.attRepo.findByStudent(studentID);
    return SUBJECTS.map((subject) => {
      const subjectRecs = recs.filter((a) => a.subject === subject);
      const present = subjectRecs.filter((a) => a.status !== "Absent").length;
      return {
        subject,
        total: subjectRecs.length,
        present,
        percent: subjectRecs.length ? Math.round(present / subjectRecs.length * 100) : 100
      };
    });
  }
  async getClassAverage(subject, section) {
    const ids = roster.filter((r) => !section || r.section === section).map((r) => r.studentID);
    const allRecs = await this.attRepo.findBySubject(subject);
    const percents = ids.map((id) => {
      const recs = allRecs.filter((a) => a.studentID === id);
      if (!recs.length) return 100;
      const present = recs.filter((a) => a.status !== "Absent").length;
      return present / recs.length * 100;
    });
    if (!percents.length) return 0;
    return Math.round(percents.reduce((s, x) => s + x, 0) / percents.length);
  }
  async predictClassesNeeded(studentID, subject, target = 75) {
    const recs = await this.attRepo.findByStudentAndSubject(studentID, subject);
    const total = recs.length;
    const present = recs.filter((a) => a.status !== "Absent").length;
    if (total === 0) return 0;
    if (present / total * 100 >= target) return 0;
    let x = 0;
    while ((present + x) / (total + x) * 100 < target && x < 200) x++;
    return x;
  }
};
var attendanceService = new AttendanceService();

// src/controllers/attendance.controller.ts
var getAttendance = async (req, res, next) => {
  try {
    const studentID = req.query.studentID;
    const subject = req.query.subject;
    let records = await repositories.attendance.findAll();
    if (studentID) {
      records = records.filter((r) => r.studentID === studentID);
    }
    if (subject) {
      records = records.filter((r) => r.subject === subject);
    }
    if (req.user.role === "student") {
      records = records.filter((r) => r.studentID === req.user.userID);
    }
    res.json(records);
  } catch (error) {
    next(error);
  }
};
var logAttendance = async (req, res, next) => {
  try {
    const { subject, status } = req.body;
    const studentID = req.user.userID;
    const record = await attendanceService.logAttendance(studentID, subject, status, studentID);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};
var markAttendance = async (req, res, next) => {
  try {
    const { studentID, subject, status } = req.body;
    const teacherID = req.user.userID;
    const record = await attendanceService.setStudentStatus(studentID, subject, status, teacherID);
    res.json(record);
  } catch (error) {
    next(error);
  }
};
var getSubjectStats = async (req, res, next) => {
  try {
    const studentID = req.params.studentID;
    if (req.user.role === "student" && req.user.userID !== studentID) {
      return res.status(403).json({ error: "Access denied" });
    }
    const stats = await attendanceService.getSubjectStats(studentID);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
var getClassAverage = async (req, res, next) => {
  try {
    const subject = req.query.subject;
    const section = req.query.section;
    if (!subject) return res.status(400).json({ error: "subject query parameter is required" });
    const average = await attendanceService.getClassAverage(subject, section);
    res.json({ average });
  } catch (error) {
    next(error);
  }
};
var predictClasses = async (req, res, next) => {
  try {
    const studentID = req.params.studentID;
    const subject = req.query.subject;
    if (!subject) return res.status(400).json({ error: "subject query parameter is required" });
    if (req.user.role === "student" && req.user.userID !== studentID) {
      return res.status(403).json({ error: "Access denied" });
    }
    const needed = await attendanceService.predictClassesNeeded(studentID, subject);
    res.json({ needed });
  } catch (error) {
    next(error);
  }
};

// src/services/assignment.service.ts
var AssignmentService = class {
  asgRepo = repositories.assignments;
  async getAssignments() {
    return await this.asgRepo.findAll();
  }
  async getAssignment(id) {
    return await this.asgRepo.findById(id);
  }
  async createAssignment(data) {
    return await this.asgRepo.create({
      ...data,
      assignmentID: generateId("as")
    });
  }
  async updateAssignment(id, updates) {
    return await this.asgRepo.update(id, updates);
  }
  async deleteAssignment(id) {
    return await this.asgRepo.delete(id);
  }
  async toggleChecklist(assignmentID, itemID) {
    const asg = await this.asgRepo.findById(assignmentID);
    if (!asg) return null;
    const checklist = asg.checklist.map(
      (c) => c.itemID === itemID ? { ...c, done: !c.done } : c
    );
    return await this.asgRepo.update(assignmentID, { checklist });
  }
  async addChecklistItem(assignmentID, label) {
    const asg = await this.asgRepo.findById(assignmentID);
    if (!asg) return null;
    const checklist = [
      ...asg.checklist,
      { itemID: generateId("c"), label, done: false }
    ];
    return await this.asgRepo.update(assignmentID, { checklist });
  }
};
var assignmentService = new AssignmentService();

// src/controllers/assignment.controller.ts
var getAssignments = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAssignments();
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};
var createAssignment = async (req, res, next) => {
  try {
    const data = req.body;
    data.createdBy = req.user.userID;
    if (!data.checklist) {
      data.checklist = [];
    }
    const assignment = await assignmentService.createAssignment(data);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};
var updateAssignment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const assignment = await assignmentService.updateAssignment(id, req.body);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};
var deleteAssignment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const success = await assignmentService.deleteAssignment(id);
    if (!success) return res.status(404).json({ error: "Assignment not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
var toggleChecklist = async (req, res, next) => {
  try {
    const id = req.params.id;
    const itemID = req.params.itemID;
    const assignment = await assignmentService.toggleChecklist(id, itemID);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};
var addChecklistItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { label } = req.body;
    const assignment = await assignmentService.addChecklistItem(id, label);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// src/services/event.service.ts
var EventService = class {
  eventRepo = repositories.events;
  rsvpRepo = repositories.rsvps;
  async getEvents(publishedOnly = false) {
    if (publishedOnly) {
      return await this.eventRepo.findPublished();
    }
    return await this.eventRepo.findAll();
  }
  async getEvent(id) {
    return await this.eventRepo.findById(id);
  }
  async createEvent(data) {
    return await this.eventRepo.create({
      ...data,
      eventID: generateId("e")
    });
  }
  async updateEvent(id, updates) {
    return await this.eventRepo.update(id, updates);
  }
  async deleteEvent(id) {
    return await this.eventRepo.delete(id);
  }
  async toggleRsvp(userID, eventID, field) {
    const existing = await this.rsvpRepo.findByUserAndEvent(userID, eventID);
    if (existing) {
      return await this.rsvpRepo.update(userID, eventID, {
        [field]: !existing[field]
      });
    }
    return await this.rsvpRepo.create({
      userID,
      eventID,
      attending: field === "attending",
      bookmarked: field === "bookmarked"
    });
  }
  async getRsvp(userID, eventID) {
    return await this.rsvpRepo.findByUserAndEvent(userID, eventID);
  }
};
var eventService = new EventService();

// src/controllers/event.controller.ts
var getEvents = async (req, res, next) => {
  try {
    const publishedOnly = req.user.role !== "admin";
    const events = await eventService.getEvents(publishedOnly);
    res.json(events);
  } catch (error) {
    next(error);
  }
};
var createEvent = async (req, res, next) => {
  try {
    const data = req.body;
    data.createdByAdminID = req.user.userID;
    const event = await eventService.createEvent(data);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};
var updateEvent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const event = await eventService.updateEvent(id, req.body);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    next(error);
  }
};
var deleteEvent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const success = await eventService.deleteEvent(id);
    if (!success) return res.status(404).json({ error: "Event not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
var toggleRsvp = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { field } = req.body;
    const userID = req.user.userID;
    if (field !== "attending" && field !== "bookmarked") {
      return res.status(400).json({ error: "Invalid field" });
    }
    const rsvp = await eventService.toggleRsvp(userID, id, field);
    res.json(rsvp);
  } catch (error) {
    next(error);
  }
};
var getRsvp = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userID = req.user.userID;
    const rsvp = await eventService.getRsvp(userID, id);
    if (!rsvp) return res.status(404).json({ error: "RSVP not found" });
    res.json(rsvp);
  } catch (error) {
    next(error);
  }
};

// src/services/ai.service.ts
var AIService = class {
  async processQuery(userID, inputText) {
    const low = inputText.toLowerCase();
    const stats = await attendanceService.getSubjectStats(userID);
    if (low.includes("lowest") || low.includes("risk") || low.includes("below")) {
      const worst = [...stats].sort((a, b) => a.percent - b.percent)[0];
      const risk = stats.filter((s) => s.percent < 75);
      if (risk.length === 0) {
        return `Good news \u2014 you're above 75% in every subject. Your lowest is ${worst.subject} at ${worst.percent}%.`;
      }
      const needed = await attendanceService.predictClassesNeeded(userID, worst.subject);
      return `\u26A0 ${worst.subject} is your lowest at ${worst.percent}%. Attend the next ${needed} class${needed > 1 ? "es" : ""} to get back to 75%.`;
    }
    if (low.includes("due") || low.includes("deadline") || low.includes("assignment") || low.includes("task")) {
      const allAssignments = await assignmentService.getAssignments();
      const pending = allAssignments.filter((a) => (a.createdBy === userID || a.createdBy === "t1") && !a.completed).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      if (!pending.length) return "You're all caught up \u2014 no pending tasks! \u{1F389}";
      const n = pending[0];
      const d = Math.ceil((new Date(n.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
      let relStr = `in ${d}d`;
      if (d < 0) relStr = `${Math.abs(d)}d overdue`;
      else if (d === 0) relStr = "today";
      else if (d === 1) relStr = "tomorrow";
      return `Your next deadline is "${n.title}" (${n.subject}) \u2014 due ${relStr}. You have ${pending.length} pending task${pending.length > 1 ? "s" : ""} total.`;
    }
    if (low.includes("event") || low.includes("workshop") || low.includes("hackathon")) {
      const events = await eventService.getEvents(true);
      const upcoming = events.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).slice(0, 2);
      if (!upcoming.length) return "No upcoming events on the calendar right now.";
      return `Upcoming: ${upcoming.map((e) => `${e.title} (${e.category})`).join(" and ")}. Head to the Events tab to RSVP!`;
    }
    if (low.includes("attendance") || low.includes("overall") || low.includes("percent")) {
      const pct = await attendanceService.getAttendancePercent(userID);
      return `Your overall attendance is ${pct}%. ${pct >= 75 ? "You're eligible for exams. \u2705" : "That's below the 75% threshold \u26A0"}`;
    }
    return "I can help with attendance, deadlines, and events. Try one of the quick replies below \u{1F447}";
  }
};
var aiService = new AIService();

// src/controllers/ai.controller.ts
var queryAI = async (req, res, next) => {
  try {
    const { inputText } = req.body;
    const userID = req.user.userID;
    if (!inputText) {
      return res.status(400).json({ error: "inputText is required" });
    }
    const responseText = await aiService.processQuery(userID, inputText);
    res.json({
      queryID: `q_${Date.now()}`,
      userID,
      inputText,
      inputType: "text",
      responseText,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// src/controllers/user.controller.ts
var getUsers = async (req, res, next) => {
  try {
    const users2 = await repositories.users.findAll();
    const safeUsers = users2.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  } catch (error) {
    next(error);
  }
};
var getRoster = async (req, res, next) => {
  try {
    res.json(roster);
  } catch (error) {
    next(error);
  }
};

// src/controllers/reference.controller.ts
var getSubjects = (req, res, next) => {
  res.json(SUBJECTS);
};
var getSections = (req, res, next) => {
  res.json(SECTIONS);
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt2.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// src/middleware/role.middleware.ts
var requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

// src/routes/index.ts
var router = Router();
router.post("/auth/login", login);
router.get("/auth/me", authenticate, getMe);
router.get("/users", authenticate, requireRole("admin"), getUsers);
router.get("/users/roster", authenticate, requireRole("teacher", "admin"), getRoster);
router.get("/reference/subjects", authenticate, getSubjects);
router.get("/reference/sections", authenticate, getSections);
router.get("/attendance", authenticate, getAttendance);
router.post("/attendance", authenticate, requireRole("student"), logAttendance);
router.put("/attendance/mark", authenticate, requireRole("teacher"), markAttendance);
router.get("/attendance/stats/:studentID", authenticate, requireRole("student", "teacher"), getSubjectStats);
router.get("/attendance/class-average", authenticate, requireRole("teacher"), getClassAverage);
router.get("/attendance/predict/:studentID", authenticate, requireRole("student"), predictClasses);
router.get("/assignments", authenticate, getAssignments);
router.post("/assignments", authenticate, requireRole("student", "teacher"), createAssignment);
router.put("/assignments/:id", authenticate, requireRole("student", "teacher"), updateAssignment);
router.delete("/assignments/:id", authenticate, requireRole("student", "teacher"), deleteAssignment);
router.put("/assignments/:id/checklist/:itemID", authenticate, requireRole("student"), toggleChecklist);
router.post("/assignments/:id/checklist", authenticate, requireRole("student"), addChecklistItem);
router.get("/events", authenticate, getEvents);
router.post("/events", authenticate, requireRole("admin"), createEvent);
router.put("/events/:id", authenticate, requireRole("admin"), updateEvent);
router.delete("/events/:id", authenticate, requireRole("admin"), deleteEvent);
router.post("/events/:id/rsvp", authenticate, requireRole("student"), toggleRsvp);
router.get("/events/:id/rsvp", authenticate, requireRole("student"), getRsvp);
router.post("/ai/query", authenticate, requireRole("student"), queryAI);
var routes_default = router;

// src/middleware/error.middleware.ts
var errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};

// src/app.ts
var app = express();
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", routes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
var startServer = () => {
  try {
    app_default.listen(config.port, () => {
      console.log(`\u{1F680} ISAS Backend running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
