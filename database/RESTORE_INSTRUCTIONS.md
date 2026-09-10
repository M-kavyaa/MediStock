# MediStock Phase 1 Restore Instructions

This directory contains the exact working baseline snapshot for **MediStock Phase 1 Deployed State**.

---

## 1. Codebase Restoration Point

The baseline working state is tagged in Git as `v1.0-phase1-deployed` and backed up on branch `phase1-deployed-backup`.

### To restore the working codebase from Git:
```bash
git checkout phase1-deployed-backup
```
*or*
```bash
git checkout tags/v1.0-phase1-deployed
```

---

## 2. Database Schema & Data Restoration

If any future changes cause database corruption or schema mismatch, you can restore the working Aiven MySQL database using `database/import_aiven.js` or directly executing `database/medistock_phase1_backup.sql`:

```bash
node database/import_aiven.js
```

---

## 3. Verified Working Baseline Specs

* **Frontend**: Vercel Static HTML/CSS/JS (`frontend/config.js` auto-detects localhost vs production)
* **Backend**: Node.js/Express on Render (`https://medistock-8zrd.onrender.com`)
* **Database**: Free MySQL on Aiven (`mysql-1d6db022-mittalkavya2602-medistock.i.aivencloud.com:25268`)
* **FEFO Logic & Transactions**: Single-connection transaction pooled connection handling verified.
