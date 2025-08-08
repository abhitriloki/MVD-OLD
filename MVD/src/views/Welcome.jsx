import React, { useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    Image
} from "react-native";
import {
    bold,
    splash_gif
} from "../config/Constants";
import { useNavigation, CommonActions } from "@react-navigation/native";
import * as colors from "../assets/css/Colors";

const Welcome = (props) => {
    const navigation = useNavigation();

    setTimeout(() => navigat_splash(), 3000)
    const navigat_splash = () =>{
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Splash" }],
            })
        );
    }

    return (
        <TouchableOpacity activeOpacity={1} onPress={navigat_splash} style={styles.background}>
            <StatusBar
                backgroundColor={colors.theme_bg}
            />
             <View style={{ height: '30%', width: '100%', alignSelf: 'center' }}>
                <Image source={splash_gif} style={{ height: undefined, width:undefined, flex:1}}/>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    background: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.theme_bg_three,
    },
    logo_container: {
        height: 196,
        width: 196,

    },
    logo: {
        height: undefined,
        width: undefined,
        flex: 1,
        borderRadius: 98
    },
    spl_text: {
        fontFamily: bold,
        fontSize: 18,
        color: colors.theme_fg_three,
        letterSpacing: 2,
    },
});

export default Welcome;