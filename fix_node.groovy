import jenkins.model.*
import hudson.model.*
import hudson.plugins.nodejs.tools.*
import hudson.tools.*

def instance = Jenkins.get()
def descriptor = instance.getDescriptor(NodeJSInstallation.class)
def installations = descriptor.getInstallations()
def newInstallations = []

// Standard installer for 22.12.0
def installer = new NodeJSInstaller("22.12.0", "", 72)
def prop = new InstallSourceProperty([installer])
def newInst = new NodeJSInstallation("NodeJS-22", "", new DescribableList<ToolProperty<?>, ToolPropertyDescriptor>(null, [prop]))

boolean replaced = false
def updatedList = []
for (inst in installations) {
    if (inst.getName() == "NodeJS-22") {
        updatedList << newInst
        replaced = true
    } else {
        updatedList << inst
    }
}
if (!replaced) {
    updatedList << newInst
}

descriptor.setInstallations(updatedList as NodeJSInstallation[])
descriptor.save()
println "Successfully configured NodeJS-22 (22.12.0) in Jenkins."
