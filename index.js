'use strict';

var _app = require('./bin/app');

var _constant = require('./bin/constant');

var _constant2 = _interopRequireDefault(_constant);

var _stickySession = require('sticky-session');

var _stickySession2 = _interopRequireDefault(_stickySession);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var agent = require('./bin/agent'); /**
                                     * Created by robin on 7/1/16.
                                     */


if (_constant2.default.useCluster) {
  /*const ClusterServer = {
    name: 'ClusterServer',
    cpus: os.cpus().length,
    autoRestart: true, // Restart threads on death?
    start: function start (server, port) {
      const me = ClusterServer
      let i
      if (cluster.isMaster) {
        for (i = 0; i < me.cpus; i += 1) {
          agent.logger.info(`${me.name}: starting worker thread #${i}`)
          const worker = cluster.fork()
          me.forker(worker)
        }
        cluster.on('exit', (worker, code, signal) => {
          // Log deaths!
          agent.logger.info(`${me.name}: worker ${worker.process.pid} died.`)
          // If autoRestart is true, spin up another to replace it
          if (signal) {
            agent.logger.log(`worker was killed by signal: ${signal}`)
          } else if (code !== 0) {
            agent.logger.log(`worker exited with error code: ${code}`)
          }
          if (me.autoRestart) {
            agent.logger.info(`${me.name}: Restarting worker thread...`)
            me.forker(cluster.fork())
          }
        })
      } else {
        // Worker threads run the server
        server.listen(port, () => {
          agent.logger.info('Node started, listening to port ', port)
        })
      }
    },
    forker: function forker (worker) {
      worker.on('exit', (code, signal) => {
        if (signal) {
          agent.logger.log(`worker was killed by signal: ${signal}`)
        } else if (code !== 0) {
          agent.logger.log(`worker exited with error code: ${code}`)
        } else {
          agent.logger.log('worker success!')
        }
      })
    }
  }
   ClusterServer.name = 'RopServer' // rename ClusterServer instance
  ClusterServer.autoRestart = true
  ClusterServer.start(server, app.get('port'))*/
  _stickySession2.default.listen(_app.server, _app.app.get('port'));
} else {
  _app.server.listen(_app.app.get('port'), function () {
    agent.logger.info('Node 已启动，并开始监听端口', _app.app.get('port'));
  });
  _app.server.listen(_constant2.default.optionPort, function () {
    agent.logger.info('Node 已启动，并开始监听端口', _constant2.default.optionPort);
  });
}