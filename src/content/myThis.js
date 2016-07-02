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

var wtr_myThis = {}

/*
When a function is registered as handler, it has no reference to the object on which
it was originally declared.
One possibility to face this problem is to add a reference to the original object on the
function, allowing the object to be retrieved from the function.

This method adds the provided object as the property "myThis" on all its properties
of type "function".
*/
wtr_myThis.registerAsMyThis = function(_o)
{
	for (var i in _o)
	{
		if (typeof _o[i] == "function")
			_o[i].myThis = _o;
	}
}