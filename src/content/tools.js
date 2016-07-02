/*******************************************************************************
 * Copyright (c) 2006 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *	Marc Guillemot - initial version
 *******************************************************************************/
const ApplicationName = 'WebTestsRecorder';

function Log(category) {
	// DEBUG
	var LOG_THRESHOLD = 'DEBUG';
	// RELEASE
	//var LOG_THRESHOLD = 'WARN';

	var log = this;
	var self = this;
	this.category = category;

	function LogLevel(level, name) {
		this.level = level;
		this.name = name;
		var self = this;
		log[name.toLowerCase()] = function(msg) {
			log.log(self, msg)
		};
	}

	this.DEBUG = new LogLevel(1, 'DEBUG');
	this.INFO = new LogLevel(2, 'INFO');
	this.WARN = new LogLevel(3, 'WARN');
	this.ERROR = new LogLevel(4, 'ERROR');

	this.log = function(level, msg) {
		var threshold = this[LOG_THRESHOLD];
		if (level.level >= threshold.level) {
			var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
			if (consoleService != null) {
				consoleService.logStringMessage(ApplicationName + ' [' + level.name + '] ' + this.category + ': ' + msg);
			}
		}
	}
}