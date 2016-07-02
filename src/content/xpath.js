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
XPath explorer
*/
const XPATH_ATTRIBUTE = "wtrxpath"; // the name of the attribute set on nodes found by xpath evaluation (used by applied style)
const XPATH_ATTRIBUTE_VALUE_SELECTED = "selected";
const XPATH_ATTRIBUTE_VALUE_NOTSELECTED = "notSelected";

var xpathTreeView = {
	log: new Log("xpath"),
	rowCount : 0,
	tabResults : new Array(),
	bInvalidXPath_: true,
	bHighlightNodes_: false,
	init:
		function(_oDoc, _strXPath)
		{
			try
			{
				bHighlightNodes_ = (_oDoc.contentType != "text/xml")
				if (bHighlightNodes_)
					StylesheetUtis_addStyleSheet(_oDoc, "chrome://webtestrecorder/content/stylesheets/xpath.css");
				
				// reset member variables (must be done before evaluating XPath as it changes some attributes)
				this.reset_();

				this.oDocument = _oDoc;
				this.strXPath = _strXPath;
				var oResult;
				try
				{
					oResult = _oDoc.evaluate(_strXPath, _oDoc, null, XPathResult.ANY_TYPE, null);
					this.bInvalidXPath_ = false;
				}
				catch (e) // invalid xpath
				{
					this.log.debug("Invalid XPath: " + _strXPath);
					this.rowCount = 1;
					this.singleResult_asString_ = "Invalid XPath";
					this.singleResult_typeString_ = "Invalid XPath";
					this.singleResult_nodeName_ = "Invalid XPath";
					this.updateNbElements_();
					return;
				}
				
				this.log.debug("XPath result: " + oResult + " (type: " + oResult.resultType + ")");
				this.resultType_ = oResult.resultType;
				this.singleResult_typeString_ = this.mapResultType_[this.resultType_];

				switch (oResult.resultType)
				{
					case XPathResult.BOOLEAN_TYPE:
						this.singleResult_asString_ = "" + oResult.booleanValue;
						this.rowCount++;
						break;
					case XPathResult.NUMBER_TYPE:
						this.singleResult_asString_ = "" + oResult.numberValue;
						this.rowCount++;
						break;
					case XPathResult.STRING_TYPE:
						this.singleResult_asString_ = oResult.stringValue;
						this.rowCount++;
						break;
					default:
						this.log.debug("Iterating through results...");
						var oCurResult = oResult.iterateNext();
						while (oCurResult != null)
						{
							this.tabResults[this.rowCount] = oCurResult;
							this.rowCount++;
							oCurResult = oResult.iterateNext();
						}
						// must be done after having read the nodes as it impacts the DOM
						if (bHighlightNodes_)
							this.initAttributes_(XPATH_ATTRIBUTE, XPATH_ATTRIBUTE_VALUE_NOTSELECTED);
				}
				this.updateNbElements_();
			}
			catch (e)
			{
				this.log.logError(e);
			}
		},

	/**
	* Indicates if the xpath evaluates to a single result that is not a node (ie a String or Boolean or ...)
	*/
	isSingleResultAsString:
		function()
		{
			return this.singleResult_asString_ != null;
		},
		
	getCellText : 
    	function(row, _oColumn)
    	{
			try
			{
				var strColumnId = _oColumn.id ? _oColumn.id : _oColumn; // in FF 1.5, column is an object

				// result is not a nodeset
				if (this.isSingleResultAsString())
				{
					if (strColumnId == "wtr_XPathResultTree_value")
						return this.singleResult_asString_;
					else if (strColumnId == "wtr_XPathResultTree_type")
						return this.singleResult_typeString_;
					else // node name
						return this.singleResult_nodeName_;
				}

				var curNode = this.tabResults[row];
				if (curNode == null)
				{
					this.log.error("No node found for " + row + "(total: " + this.rowCount + ")");
					return null;
				}
				
				if (strColumnId == "wtr_XPathResultTree_nodeName")
					return curNode.nodeName;
				else if (strColumnId == "wtr_XPathResultTree_type")
					return this.mapNodeType[curNode.nodeType];
				else
				{
					// save the string representation on the node
					// else style changes on it are visible
					if (!curNode.wtr_XPathString)
						curNode.wtr_XPathString = this.nodeToString_(curNode);
					return curNode.wtr_XPathString.replace(/\n/g, "\u21B5");
				}
			}
			catch (e)
			{
				this.log.logError(e);
			}
			return "";
	    },
    setTree: 
    	function(treebox)
    	{ 
    		this.treebox = treebox;
    	},

	isContainer: function(row){ return false; },
	isSeparator: function(row){ return false; },
	isSorted: function(row){ return false; },
	getLevel: function(row){ return 0; },
	getImageSrc: function(row,col){ return null; },
	getRowProperties: function(row,props){},
	getCellProperties: function(row,col,props){},
	getColumnProperties: function(colid,col,props){},
	
	/*
		Higlights the selected nodes of the treeview:
	*/
	higlightNodes:
		function()
		{
			// xml document, don't change the layout
			if (!bHighlightNodes_)
				return;

			// if result is not a node, nothing to select
			if (this.isSingleResultAsString())
				return;

			for (var i=0; i<this.rowCount; ++i)
			{
				var curNode = this.tabResults[i];
				var strAttrValue = this.selection.isSelected(i) ? XPATH_ATTRIBUTE_VALUE_SELECTED : XPATH_ATTRIBUTE_VALUE_NOTSELECTED;
 				if (curNode.setAttribute) // not for instance on #document
					curNode.setAttribute(XPATH_ATTRIBUTE, strAttrValue);
			}
		},
	
	mapNodeType: {},
	mapResultType_: {},
	initMapNodeType:
		function()
		{
			var m = this.mapNodeType;
			m[Node.ELEMENT_NODE] = "element";
			m[Node.ATTRIBUTE_NODE] = "attribute";
			m[Node.TEXT_NODE] = "text";
			m[Node.CDATA_SECTION_NODE] = "CData";
			m[Node.ENTITY_REFERENCE_NODE] = "reference";
			m[Node.ENTITY_NODE] = "entity";
			m[Node.PROCESSING_INSTRUCTION_NODE] = "processing";
			m[Node.COMMENT_NODE] = "comment";
			m[Node.DOCUMENT_NODE] = "document";
			m[Node.DOCUMENT_TYPE_NODE] = "document type";
			m[Node.DOCUMENT_FRAGMENT_NODE] = "document fragment";
			m[Node.NOTATION_NODE] = "notation";
			
			m = this.mapResultType_;
			m[XPathResult.NUMBER_TYPE] = "number";
			m[XPathResult.STRING_TYPE] = "string";
			m[XPathResult.BOOLEAN_TYPE] = "boolean";
		},
		
	/**
	* Gives a string representation of the node
	* @param _oNode: the node
	*/
	nodeToString_:
		function(_oNode)
		{
			switch (_oNode.nodeType)
			{
				case Node.ELEMENT_NODE:
					return this.elementToString_(_oNode);
				case Node.ATTRIBUTE_NODE:
					return _oNode.localName + '="' + _oNode.nodeValue + '"';
				case Node.TEXT_NODE:
					return _oNode.nodeValue;
				case Node.DOCUMENT_NODE:
					return this.elementToString_(_oNode.documentElement);
				case Node.CDATA_SECTION_NODE:
					return _oNode.nodeValue;
				case Node.COMMENT_NODE:
					return _oNode.nodeValue;
				default:
					return "Node type not yet handled: " + _oNode.nodeType;
			}
		},

	elementToString_:
		function(_oElementNode)
		{
			var str = "<" + _oElementNode.localName;
			var oAttributes = _oElementNode.attributes;
			for (var i=oAttributes.length-1; i>=0; --i)
			{
				var strAttributeName = oAttributes.item(i).localName;
				// don't display attributes added by WTR
				if (strAttributeName.indexOf("wtr") != 0)
					str += " " + strAttributeName + "=\"" + oAttributes.item(i).nodeValue + "\"";
			}
			
			if (_oElementNode.firstChild == null)
				str += "/";
			str += ">";
			return str;
		},

	/**
		Resets the object state
	*/	
	reset_:
		function()
		{	
			for (var i=0; i<this.tabResults.length; ++i)
			{
				var curNode = this.tabResults[i];
				if (curNode.removeAttribute) // not for instance on  #document
					curNode.removeAttribute(XPATH_ATTRIBUTE);
			}
			this.bInvalidXPath_ = true;
			this.rowCount = 0;
			this.tabResults = new Array();
			delete this.singleResult_asString_;
	
			this.singleResult_nodeName_ = "";
		},

	/**
	 Sets the attributes with the provided (name, value) on all current results
	*/		
	initAttributes_:
		function(_strAttributeName, _strAttributeValue)
		{
			for (var i=0; i<this.rowCount; ++i)
			{
				var curNode = this.tabResults[i];
 				if (curNode.setAttribute) // not for instance on  #document
	 				curNode.setAttribute(XPATH_ATTRIBUTE, XPATH_ATTRIBUTE_VALUE_NOTSELECTED);
			}
		}
};

/**
Indicates the number of results of the xpath evaluation, nothing if current XPath is invalid
*/
xpathTreeView.updateNbElements_ = function()
{
	var oLabel = document.getElementById("xpath_nbResults");
	if (!oLabel.originalLabel)
		oLabel.originalLabel = oLabel.value;
	oLabel.value = oLabel.originalLabel;

	if (!this.bInvalidXPath_)
		oLabel.value += this.rowCount;
}

xpathTreeView.initMapNodeType();

/**
Evaluates the XPath expression.
It is the timed command for the XPath field
*/
xpathTreeView.evaluateXPath = function()
{
	var myThis = arguments.callee.myThis;
	try
	{
		var oTree = document.getElementById("treeXPathResults");
		oTree.view = null;

		var strXPath = document.getElementById("tbXPath").value;
		var oDoc = window.top.document.getElementById("content").contentDocument;
		myThis.init(oDoc, strXPath);
		oTree.view = xpathTreeView;
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/*
Handles the selection of some XPath results
Configured as onselect for the <tree>
@param _oTree the tree
*/
xpathTreeView.handleSelection = function(_oTree)
{
	var myThis = arguments.callee.myThis;
	try
	{
		myThis.higlightNodes();
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

// register xpathTreeView as property on all its function to allow them to retrieve it when detached
wtr_myThis.registerAsMyThis(xpathTreeView);