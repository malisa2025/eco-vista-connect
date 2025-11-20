import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, Mail, MailOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({unreadCount} unread)
                </span>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You'll see notifications here when you have updates
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "py-4 hover:bg-muted/50 transition-colors rounded-lg",
                      !notification.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {notification.is_read ? (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notification.link ? (
                          <Link
                            to={notification.link}
                            className="block group"
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead.mutate(notification.id);
                              }
                            }}
                          >
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {notification.title}
                            </h4>
                            <p className="text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead.mutate(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
