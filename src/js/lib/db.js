export class DBManager {
  constructor(dbName) {
    this.dbName = dbName;
    this.version = 1;
    this.db = null;
  }

  open() {
    return new Promise((resolve, reject) => {
      const openReq = indexedDB.open(this.dbName, this.version);
      openReq.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      openReq.onupgradeneeded = (event) => {
        const { oldVersion, newVersion } = event;
        const db = event.target.result;
        for (let v = oldVersion + 1; v <= newVersion; v++) {
          if (v === 1) {
            db.createObjectStore('profiles', { keyPath: 'profilePath' });
          }
        }
      };
      openReq.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // NOTE: an IndexedDB transaction auto-commits once no requests remain
  // pending at the end of a microtask turn. This relies on `trFuncWithTable`
  // issuing its cursor/insert requests back-to-back; callers must not await a
  // foreign (non-IDB) promise between table operations, or the transaction can
  // commit early in stricter engines (Firefox has historically been stricter
  // than Chrome here). `tran.commit()` finalizes explicitly once the callback
  // chain settles.
  transaction(storeName, trFuncWithTable, permission = 'readwrite') {
    if (!this.db) throw new Error('Database not opend');

    return new Promise((resolve, reject) => {
      const tran = this.db.transaction([storeName], permission);
      tran.oncomplete = (e) => {
        resolve();
      };
      tran.onerror = (e) => {
        reject(e.target.error);
      };

      const dbTable = new DBTable(tran.objectStore(storeName));
      trFuncWithTable(dbTable).then(() => {
        tran.commit();
      }).catch(reject);
    });
  }
}

class DBTable {
  constructor(objectStore) {
    this.objStore = objectStore
  }

  all() {
    return new Promise((resolve, reject) => {
      const req = this.objStore.getAll();
      req.onsuccess = (e) => {
        resolve(e.target.result);
      };
      req.onerror = (e) => {
        reject(e.target.error);
      };
    })
  }

  insert(data) {
    return new Promise((resolve, reject) => {
      const req = this.objStore.add(data);
      req.onsuccess = (e) => {
        resolve(e.target.result);
      };
      req.onerror = (e) => {
        reject(e.target.error);
      };
    })
  }

  query(prefix) {
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.bound(prefix, prefix + "\uffff");
      const req = this.objStore.openCursor(range, 'next');
      const results = [];
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = (e) => {
        reject(e.target.error);
      };
    })
  }

  truncate() {
    return new Promise((resolve, reject) => {
      const req = this.objStore.clear();
      req.onsuccess = (e) => {
        resolve(e.target.result);
      };
      req.onerror = (e) => {
        reject(e.target.error);
      };
    })
  }
}
