ElasticSurfaceFracture

What is this: Webpage containing a Javascript simulation of elastic properties.

Where is this: Simulation files are contained in js/esf. Configuration constants for it are located in Config.js at the root directory.

To reach the main website, clone git repo and open index.html (better looking) or click on:
https://mrm8391.github.io/

To run just the simulation, clone the git repo and open minimalSimulation.html or click on:
https://mrm8391.github.io/minimalSimulation

Usage: Scroll down to the simulation section, and click the initialize button. Runtime constants can be modified with the inputs to the right, but some constants can only be modified in Config.js. Check the pause box to stop the physics simulation at any time; you can use the mouse to control a camera in the scene (even when paused). Click Initialize once again to apply geometry related constants that can only apply on reload.

Code Tour:  
Config.js - Runtime constants  
Main.js - Initialize and start simulation  
Buttons.js - Inputs on page tied to triggers for the simulation. The Init button in this triggers the start of the animation  
Corner.js - Unused code to handle corner collisions. No need to look at or grade this, it's there for potential future work  
EdgeVerts.js and FractureMaintenance.js - Helpers for fracture functionality  
Particle.js - Particle object that wraps a threejs point. Used for physics  
Plane.js - Plane tesselation and helpers. This is where delaunay triangulation is used  
Spring.js - Spring object that wraps an edge. Used for physics  
Update.js - Physics and movement that gets updated at each render frame  
Utilities.js - Misc. utility functions  

Other notes:
Unfortunately, Delaunay Triangulation could not be finished before the project deadline. A partial implementation is located in js/esf/delaunayTriangulation, but a library is used in-place of this functionality (in Plane.js) in the interest of a working project. To see the results of this, the user may toggle ours vs the delaunator.

Also, due to unknown reasons, the simulation is taking a large performance hit (especially with tearing enabled). Smaller tesselation density is recommended to increase performance.

Lastly, the website portion of this is in need of cleaning up. The Javascript and CSS libraries also need to be refactored to use a package manager. Due to time constraints as college students, the libraries are bundled within the repository for now. However, both me and my collaborator intend on touching this up once the semester comes to a close.

Library and resource credit:

Bootstrap Creative Theme
Designed by Blackrock Digital. Free for non-commercial use.
https://github.com/BlackrockDigital/startbootstrap-creative

Geometry cover image
Designed and owned by Freepik. Used in accordance with their free license.
http://www.freepik.com

ThreeJS Library
Free use
https://threejs.org/

Plane intersection function
Created by an anonymous user
https://stackoverflow.com/a/38437831

ThreeJS Memory Disposal
Created by multiple users in a collaborative effort
https://stackoverflow.com/questions/33152132/three-js-collada-whats-the-proper-way-to-dispose-and-release-memory-garbag/33199591#33199591

Delaunator: This is a placeholder for generating a Delaunay Triangulation until we can get our own implementation stable and working.
Created by a private company called Mapbox
https://github.com/mapbox/delaunator

Conceptual Resources:

(Class Notes)
Mount, David M., Pless, Robert. "Delaunay Triangulation." Computational Geometry. University of Maryland, College Park, MD. 2012.

(More on Delaunay Triangulation edge cases)
https://www.ti.inf.ethz.ch/ew/Lehre/CG13/lecture/Chapter%206.pdf

(4x4 determinants)
Weston, Harley. "4 by 4 determinants." Math Central: Quandries & Queries. University of Regina. http://mathcentral.uregina.ca/QQ/database/QQ.09.07/h/rav1.html

(3x3 determinants)
https://www.youtube.com/watch?v=mEeHxKH46O0

(For Doubly Connected Edge List information)
de Berg M., van Kreveld M., Overmars M., Schwarzkopf O.C. Computational Geometry: Algorithms and Applications, Ed. 2. Springer, Berlin, Heidelberg. http://www.cs.sfu.ca/~binay/813.2011/DCEL.pdf

