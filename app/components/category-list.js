import React, { Component } from "react";
import {
  View,
  ListView,
  TouchableOpacity,
  Animated,
  StyleSheet
} from "react-native";
import Interactable from "react-native-interactable";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Link } from "react-router-native";

import Text from "./text";
import { baseStyles } from "../styles";

const styles = StyleSheet.create({
  categoryList: {},
  category: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 5,
    paddingLeft: 20,
    height: 40
  },
  categoryHeader: { padding: 5, height: 40 }
});

class CategoryList extends Component {
  render() {
    const { categories } = this.props;

    return (
      <View style={styles.categoryList}>
        {categories.map(category => {
          return <CategoryView category={category} key={category.name} />;
        })}
      </View>
    );
  }
}

class CategoryView extends Component {
  componentWillMount() {
    const { category } = this.props;

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.animation = new Animated.Value();
    this.minHeight = null;
    this.maxHeight = null;

    this.setState({
      expanded: false,
      categoryName: category.name,
      members: ds.cloneWithRows(category.list)
    });
  }

  _setMinHeight = e => {
    this.animation.setValue(20);
    if (!this.minHeight) {
      this.minHeight = 20;
    }
  };

  _setMaxHeight = e => {
    if (!this.maxHeight) {
      this.maxHeight = e.nativeEvent.layout.height;
    }
  };

  toggle = () => {
    const { expanded } = this.state;
    const minHeight = this.minHeight;
    const maxHeight = this.maxHeight;
    const initialHeight = expanded ? maxHeight + minHeight : minHeight;
    const finalHeight = expanded ? minHeight : maxHeight + minHeight;

    this.setState({
      expanded: !expanded
    });

    this.animation.setValue(initialHeight);

    Animated.timing(this.animation, {
      duration: 250,
      toValue: finalHeight
    }).start();
  };

  render() {
    const { expanded, categoryName, members } = this.state;
    const arrowDirection = expanded
      ? "keyboard-arrow-down"
      : "keyboard-arrow-right";
    const arrowIcon = (
      <Icon name={arrowDirection} style={{ fontSize: 26, height: 40 }} />
    );

    return (
      <Animated.View style={{ height: this.animation }}>
        <View style={styles.categoryHeader} onLayout={this._setMinHeight}>
          <TouchableOpacity
            style={{
              padding: 5
            }}
            onPress={this.toggle}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {arrowIcon}
              <Text style={[baseStyles.h2, { height: 40 }]}>
                {categoryName}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Interactable.View
          verticalOnly
          snapPoints={[]}
          onLayout={this._setMaxHeight}
        >
          <ListView
            contentContainerStyle={{ marginTop: 10 }}
            dataSource={members}
            noScroll
            renderRow={member => {
              return (
                <View style={styles.category}>
                  <Link to="/add-observation/categories" type={member.id}>
                    <Text>
                      {member.name}
                    </Text>
                  </Link>
                </View>
              );
            }}
          />
        </Interactable.View>
      </Animated.View>
    );
  }
}

export default CategoryList;
