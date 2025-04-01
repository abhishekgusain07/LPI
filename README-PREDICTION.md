# Prediction System Setup Guide

This document provides instructions on setting up the prediction system, particularly how to seed teams into the database and troubleshoot common issues.

## Overview

The prediction system allows users to:
1. Enter contests
2. Make predictions by dragging and dropping teams
3. Update predictions before deadlines
4. View their predictions after deadlines

## Setup Teams for Contests

For the prediction system to work properly, each contest needs teams in the database. Follow these steps:

### 1. Build the project
```bash
npm run build
```

### 2. Seed teams for a specific contest
```bash
# Using the npm script (recommended)
npm run seed-teams <contestId> [sport]

# Example for a football contest
npm run seed-teams abc123 football

# Example for a cricket contest
npm run seed-teams def456 cricket
```

Where:
- `<contestId>` is the ID of the contest you want to add teams to
- `[sport]` is optional and can be "football" (default) or "cricket"

The script will:
- Delete any existing teams for that contest
- Create new teams appropriate for the sport type
- Display the IDs of the inserted teams

## Debugging Prediction Issues

If users are experiencing issues saving predictions, try these steps:

### 1. Check Database Tables

Visit the debugging endpoint to check database connectivity and counts:
```
/api/debug/prediction
```

This will show:
- Table counts (predictions, predictionEntries, users, teams)
- Schema information

### 2. Check Console Logs

The prediction save process has detailed logging. Check your server logs for:
- `[saveContestPrediction]` entries
- Validation errors for team IDs
- Database operation success/failure

### 3. Common Issues

#### No teams in database
- The most common issue is trying to save predictions without proper team entities in the database.
- Run the team seeding script for the problem contest.

#### Invalid team IDs
- If users are seeing errors about invalid team IDs, it means the prediction is trying to use team IDs that don't exist in the database.
- This can happen when using hardcoded dummy data instead of database teams.

#### Deadline issues
- Check if the contest's prediction deadline has passed.
- The system won't allow predictions after the deadline.

## Data Structure

The prediction system uses these tables:
- `contests` - Information about contests
- `teams` - Teams associated with contests
- `predictions` - User predictions for contests
- `predictionEntries` - Individual team positions within predictions
- `predictionsUserContestIndex` - Ensures one prediction per user per contest

## Important Files

- `app/contest/[contestId]/predict/page.tsx` - Main prediction UI
- `utils/data/prediction/saveContestPrediction.ts` - Server action to save predictions
- `utils/data/prediction/getUserPrediction.ts` - Retrieves user's existing prediction
- `utils/data/contest/getContestWithTeams.ts` - Gets contest data with associated teams
- `scripts/seed-teams.ts` - Team seeding script 