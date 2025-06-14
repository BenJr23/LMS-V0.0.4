import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

const isPublicRoute = createRouteMatcher([
  '/',
  '/student-login',
  '/faculty-login',
  '/unauthorized' // Add unauthorized page to public routes
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  const currentPath = req.nextUrl.pathname;

  // Log session info for every navigation
  console.log('🔍 Navigation Debug:', {
    path: currentPath,
    isAuthenticated,
    userId,
    timestamp: new Date().toISOString()
  });

  // Skip middleware for static files and API routes that don't need auth
  if (req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) {
    return NextResponse.next();
  }

  // Handle login page redirects
  if (isAuthenticated && (currentPath === '/' || currentPath === '/student-login' || currentPath === '/faculty-login')) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const userRole = user?.privateMetadata?.role as string;

      // Log user metadata
      console.log('👤 User Metadata:', {
        userId,
        role: userRole,
        privateMetadata: user?.privateMetadata,
        publicMetadata: user?.publicMetadata,
        path: currentPath
      });

      if (!userRole) {
        console.log('⚠️ No role found for user:', userId);
        return NextResponse.next();
      }

      switch (userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        case 'faculty':
          return NextResponse.redirect(new URL('/faculty/dashboard', req.url));
        case 'student':
          return NextResponse.redirect(new URL('/student/dashboard', req.url));
        default:
          return NextResponse.next();
      }
    } catch (error) {
      console.error('💥 Error fetching user role:', error);
      return NextResponse.next();
    }
  }

  // Handle unauthenticated access
  if (!isPublicRoute(req) && !isAuthenticated) {
    console.log('🚫 Unauthenticated access attempt:', {
      path: currentPath,
      isPublicRoute: isPublicRoute(req)
    });
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Handle role-based access
  if (isAuthenticated) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const userRole = user?.privateMetadata?.role as string;

      // Log role-based access check
      console.log('🔐 Role Access Check:', {
        userId,
        role: userRole,
        path: currentPath,
        privateMetadata: user?.privateMetadata,
        publicMetadata: user?.publicMetadata
      });

      const isAdminRoute = currentPath.startsWith('/admin/');
      const isFacultyRoute = currentPath.startsWith('/faculty/');
      const isStudentRoute = currentPath.startsWith('/student/');

      // Only check role access for protected routes
      if (isAdminRoute || isFacultyRoute || isStudentRoute) {
        if (!userRole) {
          console.log('⚠️ No role found for protected route:', {
            userId,
            path: currentPath
          });
          return NextResponse.next();
        }

        const hasAccess = (
          (userRole === 'admin' && isAdminRoute) ||
          (userRole === 'faculty' && isFacultyRoute) ||
          (userRole === 'student' && isStudentRoute)
        );

        if (!hasAccess) {
          console.log('🚫 Unauthorized role access:', {
            userId,
            role: userRole,
            path: currentPath,
            hasAccess
          });
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    } catch (error) {
      console.error('💥 Error checking role access:', error);
      if (currentPath.startsWith('/admin/') || 
          currentPath.startsWith('/faculty/') || 
          currentPath.startsWith('/student/')) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
