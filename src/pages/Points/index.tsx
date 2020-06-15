import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    ScrollView,
    Image,
    SafeAreaView,
    Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather as Icon } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import { api } from '../../services/api'
import * as  ExLocation from 'expo-location'


interface Item {
    id: number,
    title: string,
    image_url: string
}

interface Point {
    id: number,
    uf: string,
    image: string,
    city: string,
    latitude: number,
    longitude: number,
    name: string
}

interface Params {
    uf: string;
    city: string;

}

const Points = () => {
    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [points, setPoints] = useState<Point[]>([])

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    const route = useRoute()

    const routeParam = route.params as Params
    const navigation = useNavigation();

    useEffect(() => {
        const loadPosition = async () => {
            const { status } = await ExLocation.requestPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Oooops...', 'Precisamos da sua permissão para obter a localização.')
                return
            }

            const location = await ExLocation.getCurrentPositionAsync()

            const { latitude, longitude } = location.coords
            setInitialPosition([latitude, longitude])
        }
        loadPosition()
    }, [])

    useEffect(() => {
        const getItems = async () => {
            try {
                const response = await api.get('items?mobile=true')
                setItems(response.data.items)
            } catch (error) {
                console.log(error)
            }
        }
        getItems()
    }, [])

    useEffect(() => {
        const getPoints = async () => {
            const response = await api.get('/points', {
                params: {
                    city: routeParam.city,
                    uf: routeParam.uf,
                    items: selectedItems
                }
            })
            setPoints(response.data.points)
        }
        getPoints()

    }, [selectedItems])


    const handleSelectedItems = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id)
        if (alreadySelected >= 0) {
            const filteredItem = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItem)
        } else {
            setSelectedItems([...selectedItems, id])
        }

    }

    const handleNavigateBack = () => {
        navigation.goBack();
    };

    const handleNavigateToDetail = (id: number) => {
        navigation.navigate('Detail', { point_id: id })
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity style={{ marginTop: 30 }}>
                    <Icon
                        name="arrow-left"
                        size={20}
                        color="#34CB79"
                        onPress={handleNavigateBack}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>
                    {" "}
          Encontre no mapa um ponto de coleta.
        </Text>
                <View style={styles.mapContainer}>
                    {initialPosition[0] !== 0 && (
                        <MapView
                            style={styles.map}
                            loadingEnabled={initialPosition[0] === 0}
                            initialRegion={{
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014,
                            }}

                        >

                            {points.map(point => (
                                <Marker
                                    key={String(point.id)}
                                    style={styles.mapMarker}
                                    onPress={() => handleNavigateToDetail(point.id)}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude,
                                    }}>

                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage}
                                            source={{ uri: point.image }} />
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            )
                            )}
                        </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {items.map(item => (
                        <TouchableOpacity
                            key={String(item.id)}
                            style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]}
                            onPress={() => handleSelectedItems(item.id)}
                            activeOpacity={0.6}>
                            <SvgUri
                                width={42}
                                height={42}
                                uri={item.image_url}
                            />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
    },

    title: {
        fontSize: 20,
        fontFamily: "Ubuntu_700Bold",
        marginTop: 24,
    },

    description: {
        color: "#6C6C80",
        fontSize: 16,
        marginTop: 4,
        fontFamily: "Roboto_400Regular",
    },

    mapContainer: {
        flex: 1,
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 16,
    },

    map: {
        width: "100%",
        height: "100%",
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: "#34CB79",
        flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        alignItems: "center",
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: "cover",
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        color: "#FFF",
        fontSize: 13,
        lineHeight: 20
    },

    itemsContainer: {
        flexDirection: "row",
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#eee",
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "space-between",

        textAlign: "center",
    },

    selectedItem: {
        borderColor: "#34CB79",
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: "Roboto_400Regular",
        textAlign: "center",
        fontSize: 13,
    },
});

export default Points;
