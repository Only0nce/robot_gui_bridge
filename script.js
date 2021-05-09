var ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
});

ros.on('connection', function () {
  document.getElementById("status").innerHTML = "Connected";
  document.getElementById("status").style.color = "#27F60A";
});

ros.on('error', function (error) {
  document.getElementById("status").innerHTML = "Error";
  document.getElementById("status").style.color = "#FF3006";
});

ros.on('close', function () {
  document.getElementById("status").innerHTML = "Disconnected";
  document.getElementById("status").style.color = "#000000";
});

cmd_vel = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd_vel",
  messageType: 'geometry_msgs/Twist'
});

linear_global = []
angular_global = []
x_global = 0

move = function (linear, angular) {
  console.log(linear,angular)
  if(x_global > 5){
    update(linear,angular)
    x_global = 0
  }else{
    x_global += 1
  }
  var twist = new ROSLIB.Message({
    linear: {
      x: linear,
      y: 0,
      z: 0
    },
    angular: {
      x: 0,
      y: 0,
      z: angular
    }
  });
  cmd_vel.publish(twist);
}

createJoystick = function () {
  var options = {
    zone: document.getElementById('zone_joystick'),
    threshold: 0.1,
    position: { left: 50 + '%' },
    mode: 'static',
    size: 150,
    color: '#000000',
  };
  manager = nipplejs.create(options);

  linear_speed = 0;
  angular_speed = 0;

  manager.on('start', function (event, nipple) {
    timer = setInterval(function () {
      move(linear_speed, angular_speed);
    }, 25);
  });

  manager.on('move', function (event, nipple) {
    max_linear = 5.0; // m/s
    max_angular = 2.0; // rad/s
    max_distance = 75.0; // pixels;
    linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance/max_distance;
    angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance/max_distance;
  });

  manager.on('end', function () {
    if (timer) {
      clearInterval(timer);
    }
    self.move(0, 0);
  });
}
window.onload = function () {
  createJoystick();
}

const labels = [
  '',
  '',
  '',
  '',
  '',
  'x',
];
var data = {
  labels: labels,
  datasets: [{
    label: 'linear',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 0, 0, 0, 0, 0, 5],
  },{
    label: 'angular',
    backgroundColor: 'rgb(0, 255, 255)',
    borderColor: 'rgb(0, 255, 255)',
    data: [0, 0, 0, 0, 0, 0, 0],
  }]
};

var config = {
  type: 'line',
  data,
  options: {}
};
console.log(config)
function update(linear,angular){
  linear_global.push(linear)
  angular_global.push(angular)
  if(linear_global.length > 5 && angular_global.length > 5){
    linear_global.shift()
    angular_global.shift()
  } 
  data["datasets"][0]["data"] = linear_global
  data["datasets"][1]["data"] = angular_global
  console.log(data)

  config = {
    type: 'line',
    data,
    options: {}
  };

  console.log(config)
  myChart.destroy();
  myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}