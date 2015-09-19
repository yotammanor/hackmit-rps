scriptId = 'edu.mit.hackmit.rps'  
scriptTitle = "Rock Paper Scissors"  
scriptDetailsUrl = "https://market.myo.com/app/<your app ID here>" -- see http://developerblog.myo.com/how-to-submit-your-application-to-the-myo-market/

description = [[  
Template script

Fill out out! Useful to explain what your connector does  
but right now it (as well as controls and knownIssuess) is  
only visible if someone looks at the source code.

Questions or problems? Talk to Paul (@PBernhardt)  
]]

controls = [[  
Controls:  
 - (Optional) Useful to keep things documented
 ]]

knownIssues = [[  
 - (Optional) Mention any issues
 ]]

-- Notify the user only when they start their pose
function notifyUser(edge)  
    if (edge == "down") then
        myo.notifyUserAction()
    end
end

function doPerodicThing()  
    -- You can use this to swap out different onPeriodic behaviour for different bindings
end

function doFist(edge)  
    notifyUser(edge)
    myo.mouse("left",edge)
end

-- Put the function you want to call when the user does a certain pose here
STANDARD_BINDINGS = {  
    fist            = doFist,
--    fingersSpread   = someFunction,
--    waveIn          = someFunction,
--    waveOut         = someFunction,
--    doubleTap       = someFunction,
    onPeriodic      = doPerodicThing
}

-- If you want to swap in different control schemes, you can do that by changing 'bindings'
bindings = STANDARD_BINDINGS

function onActiveChange(isActive)  
    -- Do things that need to happen when your script starts/stops being active

    -- This is the place to unlock the myo and change the locking policy if you want to be unlocked all the time.

    -- Also, cleanup and unpress any buttons that you may have started pressing in the script.
    if isActive then
        myo.setLockingPolicy("none")
    end
end

-- Tell this script when it should be active. Easiest to match against the app package or .exe name
function onForegroundWindowChange(app, title)  
    -- app = string.lower(app)
    -- --myo.debug(title .. ", " .. app)

    -- return platform == "MacOS" and app == "com.app" or platform == "Windows" and app == "app.exe"
    return true
end

function activeAppName()  
    return scriptTitle
end

function onPeriodic()  
    fn = bindings["onPeriodic"]
    if fn then
        fn()
    end
end

function onPoseEdge(pose, edge)  
    --pose = conditionallySwapWave(pose)
    --myo.debug("onPoseEdge: " .. pose .. ": " .. edge)
    fn = bindings[pose]
    if fn then
        keyEdge = edge == "off" and "up" or "down"
        fn(keyEdge)
    end
end

function conditionallySwapWave(pose)  
    if myo.getArm() == "left" then
        if pose == "waveIn" then
            pose = "waveOut"
        elseif pose == "waveOut" then
            pose = "waveIn"
        end
    end
    return pose
end  