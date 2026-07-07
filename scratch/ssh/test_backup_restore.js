const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Starting Backup & Restore Validation Test (Superuser Mode)');
  conn.exec(`
    set -e
    
    echo "=== [1/5] Dumping database soley_db ==="
    sudo -u postgres pg_dump soley_db > /tmp/soley_test_backup.sql
    echo "Dump completed successfully: /tmp/soley_test_backup.sql ($(du -sh /tmp/soley_test_backup.sql | cut -f1))"
    
    echo "=== [2/5] Creating temporary restore test database ==="
    sudo -u postgres psql -d postgres -c "DROP DATABASE IF EXISTS soley_db_restore_test;"
    sudo -u postgres psql -d postgres -c "CREATE DATABASE soley_db_restore_test;"
    
    echo "=== [3/5] Restoring dump to temporary database ==="
    sudo -u postgres psql -d soley_db_restore_test < /tmp/soley_test_backup.sql > /dev/null
    echo "Restore completed successfully."
    
    echo "=== [4/5] Verifying integrity of restored database ==="
    echo -n "Total User count in restored DB: "
    sudo -u postgres psql -d soley_db_restore_test -t -c 'SELECT COUNT(*) FROM "User";' | tr -d '[:space:]'
    echo ""
    echo -n "Total Product count in restored DB: "
    sudo -u postgres psql -d soley_db_restore_test -t -c 'SELECT COUNT(*) FROM "Product";' | tr -d '[:space:]'
    echo ""
    
    echo "=== [5/5] Cleaning up restore test database and dump file ==="
    sudo -u postgres psql -d postgres -c "DROP DATABASE soley_db_restore_test;"
    rm -f /tmp/soley_test_backup.sql
    echo "Cleanup complete. Test PASSED."
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('SSH connection closed. Exit code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
