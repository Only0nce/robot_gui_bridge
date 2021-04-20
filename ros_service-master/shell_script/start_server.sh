#! /bin/bash

source /opt/ros/kinetic/setup.bash

source ~/catkin_ws/devel/setup.bash

terminator -x roscore &

sleep 5 

terminator -x roslaunch robot_gui_bridge websocket.launch &

sleep 5

terminator -x roslaunch turtlebot3_gazebo turtlebot3_empty_world.launch

exit 0

