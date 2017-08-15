import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import Interactable from "react-native-interactable";
import { Link } from "react-router-native";

import Text from "./text";
import Geolocate from "./geolocate";
import NearbyFeatures from "./nearby-features";

import { colors } from "../styles";
import { baseStyles } from "../styles";

const Screen = {
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height - 75
};

class MapOverlay extends Component {
  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height - 80);
  }

  open = () => {
    this._drawer.setVelocity({ y: -1000 });
    this.setState({
      drawerOpen: true
    });
  };

  close = () => {
    this._drawer.setVelocity({ y: 1000 });
    this.setState({
      drawerOpen: false
    });
  };

  toggle = () => {
    this.state.drawerOpen ? this.close() : this.open();
  };

  componentWillMount() {
    this.setState({
      drawerOpen: false
    });
  }

  render() {
    const { features, onGeolocate } = this.props;
    const halfOpen = Screen.height - 40;
    const fullOpen = Screen.height - 210;
    const closed = Screen.height;

    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            right: 0,
            bottom: 280,
            width: 75,
            height: 140,
            transform: [
              {
                translateY: this._deltaY.interpolate({
                  inputRange: [fullOpen, halfOpen],
                  outputRange: [1, 170]
                })
              }
            ]
          }}
        >
          <Geolocate onGeolocate={onGeolocate} />

          <Link
            to="/add-observation/choose-point"
            style={{
              width: 60,
              height: 60,
              borderRadius: 80,
              backgroundColor: "#8212C6",
              zIndex: 10,
              position: "absolute",
              right: 15,
              marginTop: 75
            }}
          >
            <Icon
              name="add"
              style={{
                paddingTop: 10,
                paddingLeft: 10,
                fontSize: 40,
                color: "#ffffff"
              }}
            />
          </Link>
        </Animated.View>

        <Interactable.View
          style={{
            height: 400
          }}
          verticalOnly={true}
          initialPosition={{ y: halfOpen }}
          snapPoints={[{ y: fullOpen }, { y: halfOpen }, { y: closed }]}
          boundaries={{ top: fullOpen + 10 }}
          ref={view => {
            this._drawer = view;
          }}
          animatedValueY={this._deltaY}
        >
          <View style={baseStyles.nearbyPoints}>
            <View style={[baseStyles.nearbyPointsHeader]}>
              <View style={[baseStyles.nearbyPointsDescription]}>
                <TouchableOpacity onPress={this.toggle}>
                  <Text style={[baseStyles.h4]}>Nearby Points</Text>

                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {this.props.userLocation
                      ? <Text>
                          Location:{" "}
                          {this.props.userLocation.latitude.toFixed(2)},{" "}
                          {this.props.userLocation.longitude.toFixed(2)}
                        </Text>
                      : <Text>Geolocating...</Text>}
                  </View>
                </TouchableOpacity>
              </View>

              {/*
              // hide filter button temporarily
              <View style={{}}>
                <TouchableOpacity
                  style={[baseStyles.buttonOutline]}
                  onPress={this._onPressButton}
                >
                  <Text>Filter</Text>
                </TouchableOpacity>
              </View>
              */}
            </View>

            <ScrollView horizontal={true} width={Screen.width}>
              {this.props.features.map(item => {
                return (
                  <View style={[baseStyles.cardStyle]} key={item.id}>
                    <Text style={[baseStyles.h3]}>
                      {item.tags.name}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <Text>30cm away</Text>
                      <View>
                        <Text>Updated: </Text>
                        <Text>4/30/17 4:30</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        baseStyles.observationBlock,
                        { flexDirection: "row", flexWrap: "wrap" }
                      ]}
                    >
                      <Text style={[baseStyles.metadataText]}>
                        2 Observations
                      </Text>
                      <Text style={[baseStyles.textAlert]}>(2 incomplete)</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Interactable.View>
      </View>
    );
  }
}

export default MapOverlay;
