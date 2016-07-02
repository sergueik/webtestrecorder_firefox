/*******************************************************************************
 * Copyright (c) 2006 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/

/**
Unit tests for myThis.js
*/
load("UnitTestUtils.js");
load("myThis.js");


function test_registerAsMyThis()
{
	var o =
		{
			foo: function() {},
			fii: 123,
			bla: "wer",
			foo2: function(_a, _b) { return _a + _b; }
		};
		
	wtr_myThis.registerAsMyThis(o);
	assertEquals(o, o.foo.myThis);
	assertEquals(o, o.foo2.myThis);
	assertUndefined(o.bla.myThis);
}


runTests();