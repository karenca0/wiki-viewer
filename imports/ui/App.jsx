import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Container, Input, Form, Button } from "semantic-ui-react";
import SearchBar from "./SearchBar.jsx";
import { searchedHistroy } from "../api/history";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			err: "",
			title: "",
			links: [],
			content: []
		};
	}

	onSearchSubmit(word) {
		// call meteor method to get data from api
		Meteor.call("getData", word, (err, res) => {
			if (err) {
				this.setState({
					error: err
				});
				return;
			}

			console.log(res);
			this.setState({
				title: res.title,
				links: res.links.slice(0, 100),
				content: res.text["*"]
			});
		});

		// insert searched word to database
		Meteor.call("searchedHistroy.insert", word, err => {
			if (err) {
				this.setState({
					error: err
				});
				return;
			}

			this.setState({
				error: ""
			});
		});
	}

	renderHistory() {
		return this.props.history.map((item, index) => {
			return <div key={index}>{item.searchedItem}</div>;
		});
	}

	renderLinks() {
		console.log(this.state.links);

		return this.state.links.map((link, index) => {
			return (
				<Button onClick={e => this.handleClick(e)} key={index} value={link["*"]}>
					{link["*"]} 
				</Button>
			);
		});
	}

	renderContent() {
		return (
			<span dangerouslySetInnerHTML={{ __html: this.state.content }} />
		);
	}

	handleClick(event) {
		event.preventDefault();

		console.log(event.target.value);

		Meteor.call("getData", event.target.value, (err, res) => {
			if (err) {
				this.setState({
					error: err
				});
				return;
			}

			console.log(res);
			this.setState({
				title: res.title,
				links: res.links.slice(0, 100),
				content: res.text["*"]
			});
		});

		Meteor.call("searchedHistroy.insert", event.target.value, err => {
			if (err) {
				this.setState({
					error: err
				});
				return;
			}

			this.setState({
				error: ""
			});
		});
	}

	render() {
		return (
			<Container>
				<h1>Welcome to wiki viewer</h1>

				<SearchBar onSubmit={this.onSearchSubmit.bind(this)} />

				<h2>Searched History</h2>
				{this.renderHistory()}

				<h2>Title</h2>
				{this.state.title}

				<h2>Links</h2>
				{this.renderLinks()}

				<h2>Content</h2>
				{this.renderContent()}
			</Container>
		);
	}
}

export default withTracker(() => {
	const handle = Meteor.subscribe("searchedHistroy");

	return {
		history: searchedHistroy.find({}).fetch(),
		ready: handle.ready()
	};
})(App);
