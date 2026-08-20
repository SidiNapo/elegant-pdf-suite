// PM2 process definition for the self-hosted (VPS) deployment.
//
// SECURITY: only the publishable anon key belongs here. The Supabase
// service-role key must NEVER be placed in this file (or any file in the repo);
// the server code intentionally only ever reads SUPABASE_ANON_KEY.
module.exports = {
  apps: [
    {
      name: "epdfs",
      script: "./server.mjs",
      cwd: "/var/www/epdfs",
      exec_mode: "cluster",
      instances: 2,
      autorestart: true,
      max_memory_restart: "400M",
      out_file: "/var/log/epdfs/out.log",
      error_file: "/var/log/epdfs/error.log",
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        SUPABASE_URL: "REPLACE_ME",
        SUPABASE_ANON_KEY: "REPLACE_ME",
        ADMIN_PATH: "ctrl-x9k7m2p4q8n1",
      },
    },
  ],
};
