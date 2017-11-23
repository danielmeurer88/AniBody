
****************************************************************************
****************************************************************************
The following methods won't be documented in the respective classes
but they will here
****************************************************************************
****************************************************************************

/**
 * is an extension extension of the constructor function
 * it is used to instanciate all needed attributes
 * @returns {undefined}
 */
Initialize()

/**
 * reads and writes to the user input directly or uses other methods, which does that (like: MouseHandler methods)
 * writes to the instance attributes as a consequence of certain user behaviour
 * @returns {undefined}
 */
ProcessInput()

/**
 * reads and writes to instance attributes in a way that the instance behaves like wanted
 * @returns {undefined}
 */
Update()

/**
 * draws the instance on the canvas context
 * @param {context} c - the context object of the Engine's canvas 
 * @returns {undefined}
 */
Draw(c)

/**
 * makes instance visible
 * @returns {undefined}
 */
Show()

/**
 * makes instance invisible
 * @returns {undefined}
 */
Hide()

/**
 * Increases the visibility of the instance constantly from 0% to 100% in 1 second
 * @param {callbackobject} cbo - an object, which contens of a function, object that represents the thisArg of said funct, another object that is the first argument of said function
 * @returns {undefined}
 */
FadeIn(cbo)

/**
 * registers all mouse handlers needed for the instance to work properly
 * - uses MouseHandler.AddMouseHandler(...) to register
 * @returns {undefined}
 */
AddMouseHandler()

/**
 * deregisters all mouse handlers needed for the instance to work properly
 * - uses MouseHandler.RemoveMouseHandler(...) to deregister
 * @returns {undefined}
 */
RemoveMouseHandler()

/**
 * empties the Info Tab and refills it with all infos of the current tab
 * @returns {undefined}
 */
FillInfoTab()

/**
 * empties the Aufgabe Tab and refills it with all infos about the current tasks of this phase
 * @returns {undefined}
 */
FillTaskTab()

/**
 * checks if beginner mode (nooby mode) or 'anyway'-parameter is true. If yes, it dispays the current tasks
 * and askes the user if he/she wants to start an introduction to the current phase
 * @param {boolean} anyway
 * @returns {undefined}
 */
FirstTimeQuestion(anyway)

/**
 * function, which is trigged if user clicks on the help button and informs the user what is next to do
 * @returns {undefined}
 */
ClickOnHelp()

// +++++++++++++++++++++++++++++++++++++++++++++++++
// Callback-Object
// ++++++++++++++++++++++++++++++++++++++++++++++++

A callback object is an ordinary object and consists originally of three attributes:
'function' : a function,
'that' : the function's this-object
'parameter' : the function's first argument
it is often used in the AniBody Engine internally and externally by many components