# PEGS Diagram

```mermaid
classDiagram

%% invariant project.requirements == this
class Requirements

%% invariant isComposite() == true implies subRequirements.length > 0 
class Requirement {
    Guid id
    Predicate property
    Boolean isComposite()
}

%% invariant isSameProject: follows != null implies follows.project = project
%% invariant isUpTraceable: isUptraceable implies follows != null
class Artifact {
    Boolean isUpTraceable
}

class Stakeholder

class Property

class Component
Component --|> Requirement

class Actor
Actor --|> Component

Artifact "1" --> "1" Project : project
Artifact "1" --> "0-1" Requirement : follows

Project "1" --> "1" Requirements : requirements
Project "1" --> "*" Artifact : artifacts

Requirement "1" --> "*" Requirement : subRequirements

Requirements "1" --> "1" Project : project
Requirements "1" --> "*" Requirement : items

Property "1" --> "*" Stakeholder: relevantTo

```

### Property

**Elementary** or **Composite**

**Homogeneous** or **Heterogeneous**

**Homogeneous** example: "customers will have access to customer functions, and employees to both customer and flight management functions"

**Heterogeneous** example: "Error messages shall be recorded in a log"
Refers to a system component(log) and a system behavior