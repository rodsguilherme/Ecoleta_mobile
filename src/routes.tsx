import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Home from './pages/Home'
import Points from './pages/Points'
import Detail from './pages/Detail'

const AppSatck = createStackNavigator()

const Routes = () => (
    <NavigationContainer>
        <AppSatck.Navigator headerMode='none' screenOptions={{
            cardStyle: {
                backgroundColor: '#F0F0F5'
            }
        }} >
            <AppSatck.Screen name="Home" component={Home} />
            <AppSatck.Screen name="Detail" component={Detail} />
            <AppSatck.Screen name="Points" component={Points} />
        </AppSatck.Navigator>
    </NavigationContainer >
)

export default Routes