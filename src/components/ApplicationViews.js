// This component functions as the React index for the app. It holds the data in state and sets the routes and data flow to other components.

import { Route } from 'react-router-dom';
import React, { Component } from 'react';
import NavBar from './nav/NavBar';
import DataManager from '../modules/DataManager';
import ProfileBoard from './profile/ProfileBoard';
import ExploreBoard from './explore/ExploreBoard';
import InventoryBoard from './inventory/InventoryBoard';
import Welcome from './welcome/Welcome';
import auth0Client from '../auth/Auth';
import Callback from '../Callback';

export default class ApplicationViews extends Component {

    state = {
        users: [],
        cocktails: [],
        ingredients: [],
        cocktailIngredients: [],
        userCocktails: [],
        userIngredients: [],
        categoryOptions: [],
        glassOptions: [],
        ingredientTypeOptions: [],
        unitOptions: [],
        savedCocktails: []
    }

    showNav = () => {
        if (auth0Client.isAuthenticated()) {
            return <NavBar />
        }
    }

    postItem = (dataSet, databaseObject) => {
        return (DataManager.dataManager({
            "dataSet": dataSet,
            "fetchType": "POST",
            "databaseObject": databaseObject
        })
        .then(() => this.handleGetAlls(dataSet)))
    }

    deleteItem = (dataSet, specificId) => {
        return DataManager.dataManager({
            "dataSet": dataSet,
            "specificId": specificId,
            "fetchType": "DELETE",
        })
        .then(() => this.handleGetAlls(dataSet));
    }

    putItem = (dataSet, databaseObject, specificId) => {
        return (DataManager.dataManager({
            "dataSet": dataSet,
            "specificId": specificId,
            "fetchType": "PUT",
            "databaseObject": databaseObject
        })
        .then(() => this.handleGetAlls(dataSet)));
    }

    handleGetAlls = (stateName) => {
        if (stateName === "cocktailIngredients" || stateName === "userIngredients") {
            return (DataManager.dataManager({
                "dataSet": stateName,
                "fetchType": "GET-ALL",
                "embedItem": "/?_expand=ingredient"
            })
            .then(dataSet => {
                this.setState({
                    [stateName]: dataSet
                });
            }));
        } else if (stateName === "userCocktails") {
            return (DataManager.dataManager({
                "dataSet": stateName,
                "fetchType": "GET-ALL",
                "embedItem": `/?_expand=cocktail&userId=${Number(localStorage.getItem("userId"))}`
            })
            .then(dataSet => {
                this.setState({
                    [stateName]: dataSet
                });
            }));
        } else if (stateName !== "savedCocktails") {
            return (DataManager.dataManager({
                "dataSet": stateName,
                "fetchType": "GET-ALL",
                "embedItem": ""
            })
            .then(dataSet => {
                this.setState({
                    [stateName]: dataSet
                });
            }));
        }
    }

    componentDidMount() {
        Object.keys(this.state).forEach(stateName => {
            this.handleGetAlls(stateName);
        });
    }

    getSavedCocktails = () => {
        return this.state.userCocktails.filter(userCocktail => {
            return userCocktail.userId === Number(localStorage.getItem("userId"));
        }).map(userCocktail => {
            return userCocktail.cocktail;
        })
    }

    render() {
        return (
            <React.Fragment>
                {this.showNav()}
                <Route exact path="/" render={ () => {
                    return <Welcome />
                }} />
                <Route exact path="/profile" render={props => {
                    if (auth0Client.isAuthenticated()) {
                        return <ProfileBoard {...props}
                        users={this.state.users}
                        cocktails={this.state.cocktails}
                        ingredients={this.state.ingredients}
                        cocktailIngredients={this.state.cocktailIngredients}
                        userCocktails={this.state.userCocktails}
                        userIngredients={this.state.userIngredients}
                        categoryOptions={this.state.categoryOptions}
                        glassOptions={this.state.glassOptions}
                        ingredientTypeOptions={this.state.ingredientTypeOptions}
                        unitOptions={this.state.unitOptions}
                        postItem={this.postItem}
                        deleteItem={this.deleteItem}
                        putItem={this.putItem}
                        getSavedCocktails={this.getSavedCocktails}
                        handleGetAlls={this.handleGetAlls} />
                    } else {
                        return <Welcome />
                    }
                }} />

                <Route exact path="/explore" render={props => {
                    if (auth0Client.isAuthenticated()) {
                        return <ExploreBoard {...props}
                        users={this.state.users}
                        cocktails={this.state.cocktails}
                        ingredients={this.state.ingredients}
                        cocktailIngredients={this.state.cocktailIngredients}
                        userCocktails={this.state.userCocktails}
                        userIngredients={this.state.userIngredients}
                        categoryOptions={this.state.categoryOptions}
                        glassOptions={this.state.glassOptions}
                        ingredientTypeOptions={this.state.ingredientTypeOptions}
                        unitOptions={this.state.unitOptions}
                        postItem={this.postItem}
                        getSavedCocktails={this.getSavedCocktails} />
                    } else {
                        return <Welcome />
                    }
                }}
                />

                <Route exact path="/inventory" render={props => {
                    if (auth0Client.isAuthenticated()) {
                        return <InventoryBoard {...props}
                        cocktails={this.state.cocktails}
                        ingredients={this.state.ingredients}
                        userIngredients={this.state.userIngredients}
                        categoryOptions={this.state.categoryOptions}
                        glassOptions={this.state.glassOptions}
                        ingredientTypeOptions={this.state.ingredientTypeOptions}
                        unitOptions={this.state.unitOptions}
                        postItem={this.postItem}
                        deleteItem={this.deleteItem}
                        putItem={this.putItem} />
                    } else {
                        return <Welcome />
                    }
                }}
                />

                <Route exact path="/callback" render={props => {
                    return <Callback {...props}
                    handleGetAlls={this.handleGetAlls}/>
                }}/>

            </React.Fragment>
        );
    }

}
