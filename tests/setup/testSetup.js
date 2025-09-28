// tests/setup/testSetup.js
const request = require('supertest');
const express = require('express');
const db = require('../../backend/config/database');

// 測試資料庫
const testDb = new sqlite3.Database(':memory:');

beforeAll(async () => {
  // 建立測試資料表
  await new Promise((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run(`
        CREATE TABLE volunteers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          department TEXT,
          skills TEXT,
          experience_years INTEGER DEFAULT 0,
          emergency_contact TEXT,
          emergency_phone TEXT,
          address TEXT,
          birth_date DATE,
          status TEXT DEFAULT 'active',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      testDb.run(`
        CREATE TABLE schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          volunteer_id INTEGER NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          shift_type TEXT NOT NULL DEFAULT 'morning',
          location TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (volunteer_id) REFERENCES volunteers (id)
        )
      `);

      testDb.run(`
        CREATE TABLE notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          priority TEXT DEFAULT 'normal',
          is_broadcast BOOLEAN DEFAULT 0,
          recipient_ids TEXT DEFAULT '[]',
          scheduled_time DATETIME,
          sender_id INTEGER,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      testDb.run(`
        CREATE TABLE attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          volunteer_id INTEGER NOT NULL,
          date DATE NOT NULL,
          shift_type TEXT,
          status TEXT NOT NULL DEFAULT 'present',
          arrival_time TIME,
          departure_time TIME,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (volunteer_id) REFERENCES volunteers (id)
        )
      `);
    });
    resolve();
  });
});

afterAll(async () => {
  testDb.close();
});

module.exports = { testDb, request };
