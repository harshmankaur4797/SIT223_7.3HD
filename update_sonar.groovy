import hudson.plugins.sonar.*
import hudson.plugins.sonar.model.*

def instance = jenkins.model.Jenkins.getInstance()
def sonarGlobal = instance.getDescriptor(SonarGlobalConfiguration.class)

def installations = sonarGlobal.getInstallations()
def updated = false

for (installation in installations) {
    if (installation.getName() == "SonarQube") {
        println("Found SonarQube installation, checking URL...");
        if (installation.getServerUrl() == "http://localhost:9000") {
            println("Updating URL from localhost to host.docker.internal...");
            def newInst = new TriggersConfig("SonarQube", "http://host.docker.internal:9000", installation.getCredentialsId(), installation.getMojoVersion(), installation.getAdditionalProperties(), installation.getTriggers(), installation.getAdditionalAnalysisProperties())
            // Above might fail due to constructor signature. Let's just mutate it nicely:
            def props = new TriggersConfig()
            def replacement = new SonarInstallation("SonarQube", "http://host.docker.internal:9000", installation.getCredentialsId(), installation.getMojoVersion(), installation.getAdditionalProperties(), props, installation.getAdditionalAnalysisProperties())

            def newInstallations = new SonarInstallation[installations.length]
            for (int i = 0; i < installations.length; i++) {
                if (installations[i].getName() == "SonarQube") {
                    newInstallations[i] = replacement
                } else {
                    newInstallations[i] = installations[i]
                }
            }
            sonarGlobal.setInstallations(newInstallations)
            sonarGlobal.save()
            updated = true
        }
    }
}

if (!updated) {
    println("No matching SonarQube config found or it was already updated.")
} else {
    println("Successfully updated SonarQube configuration.")
}

// Trigger the build too while we are at it
def job = instance.getItemByFullName('deakin-coffee-pipeline')
if (job != null) {
    job.scheduleBuild2(0)
    println("Triggered a new build directly!")
}
