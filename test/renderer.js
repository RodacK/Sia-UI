'use strict';

// Libraries required for testing
const Application = require('spectron').Application;
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const Path = require('path');
const Crypto = require('crypto');
const Fs = require('fs');

// Chai's should syntax is executed to edit Object to have Object.should
var should = Chai.should();
// Chai's should syntax is extended to deal well with Promises
Chai.use(ChaiAsPromised);

// The one app that this suite is testing is Sia-UI
describe('renderer process', function() {
	this.timeout(5000);
	var app;
	var client;

	// Starts a new session and assigns spectron's Application instance to a
	// variable, app, available to all tests
	before('start electron', function() {
		app = new Application({
			path: Path.join(__dirname, '../node_modules/.bin/electron'),
			args: [Path.join(__dirname, '..')],
		});
		return app.start();
	});

	// Extends ChaiAsPromised's syntax with spectron's electron-specific
	// functions and assigns spectron's WebDriverIO properties to a variable,
	// client, available to all tests
	before('transfer spectron methods', function() {
		client = app.client;
		ChaiAsPromised.transferPromiseness = client.transferPromiseness;
	});

	// Close session after each test-suite
	after('stop electron', function() {
		if (app && app.isRunning()) {
			return app.stop();
		}
	});

	// Helper used to ensure a specific plugin is loaded
	function isPluginLoaded(pluginName) {
		return client.execute(function(name) {
			return Plugins[name].isLoading();
		}, pluginName).then(function(isLoading) {
			return isLoading;
		});
	}

	// Clicks all sidebar icons and ensures plugins are visible
	it('navigates correctly', function() {
		client.addCommand('showPlugin', function(name) {
			return client.waitUntil(function() {
					return isPluginLoaded(name);
				})
				.click('#' + name + '-button')
				.waitForExist('#' + name + '-view.current')
				.isVisible('#' + name + '-view').should.eventually.be.true;
		});

		return client
			.waitForExist('.current')
			.showPlugin('About')
			.showPlugin('Wallet')
			.showPlugin('Hosting')
			.showPlugin('Files')
			.showPlugin('Overview');
	});
});
