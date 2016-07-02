/*******************************************************************************
 * Copyright (c) 2007-2008 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/
/**
Creates a DOM node to represent the step as WebDriver code
@param _document the document to which the node will be added
@param _oStep the step to represent
@return the DOM node to insert in the document
*/
function createDOMNode_WebDriverRepresentation(_oStep, _document, bVisible) {
    var oStepNode = _document.createElement('div');
    if (!bVisible) {
        oStepNode.setAttribute('class', 'alternativeStep')
    }

    var conversion = conversions[_oStep.wtrStep]
    if (conversion) {
        var txt = conversion(_oStep);
        if (txt.indexOf('assertEquals') == 0) {
            txt = txt.substr('assertEquals'.length)
            WTR_DomUtils.appendNodeToNode(oStepNode, 'span', {
                'class': 'junit'
            }, 'assertEquals');
        }
        var oNode = WTR_DomUtils.appendNodeToNode(oStepNode, 'span', {}, '');
        txt = txt.replace(/"([^\"]*)"/g, '"<span class="text">$1</span>"')
        oNode.innerHTML = txt
    } else
        WTR_DomUtils.appendNodeToNode(oStepNode, 'span', {
            'class': 'comment'
        }, "// can't yet handle " + _oStep.wtrStep);

    return oStepNode;
}

// this registers the editor as listener too
setCreateDOMNode_XXXRepresentation(createDOMNode_WebDriverRepresentation)

var conversions = {}
conversions['invoke'] = function(oStep) {
    return 'wd.get("' + oStep.url + '");'
}

conversions['verifyTitle'] = function(oStep) {
    return 'assertEquals("' + oStep.text + '", wd.getTitle());'
}

conversions['clickLink'] = function(oStep) {
    var by = ''
    if (oStep.htmlId)
        by = 'id("' + oStep.htmlId + '")'
    else if (oStep.label)
        by = 'linkText("' + oStep.label + '")'
    else if (oStep.xpath)
        by = 'xpath("' + oStep.xpath + '")'

    return 'wd.findElement(By.' + by + ').click();'
}

conversions['clickButton'] = function(oStep) {
    var by = ''
    if (oStep.htmlId)
        by = 'id("' + oStep.htmlId + '")'
    else if (oStep.label)
        by = 'xpath("//input[@type = \'button\' or @type = \'submit\'][@value = \'' + oStep.label + '\']")'
    else if (oStep.xpath)
        by = 'xpath("' + oStep.xpath + '")'

    return "wd.findElement(By." + by + ").click();"
}

function identifyInputField(oStep) {
    var by = ""
    if (oStep.htmlId)
        by = 'id("' + oStep.htmlId + ')'
    else if (oStep.forLabel)
        by = 'xpath("//input[@id = //label[text() = \'' + oStep.forLabel + '\']/@for]")'
    else if (oStep.xpath)
        by = 'xpath("' + oStep.xpath + '")'
    else if (oStep.name)
        by = 'xpath("//input[@name = \'' + oStep.name + '\']")'
    return by
}
conversions["setInputField"] = function(oStep) {
    return 'wd.findElement(By.' + identifyInputField(oStep) + ').type("' + oStep.value + '");'
}

conversions["setFileField"] = function(oStep) {
    oStep.value = oStep.fileName
    return conversions["setInputField"](oStep)
}

conversions["verifyInputField"] = function(oStep) {
    return 'assertEquals("' + oStep.value + '", ' + identifyInputField(oStep) + '.getValue());'
}