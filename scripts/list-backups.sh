#!/bin/bash

BACKUP_DIR="backups"

echo "🗄️  Available Database Backups"
echo "================================"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ No backups directory found"
    exit 1
fi

BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.bak" | wc -l)

if [ $BACKUP_COUNT -eq 0 ]; then
    echo "📭 No backup files found in $BACKUP_DIR/"
    echo ""
    echo "💡 To create a backup, run:"
    echo "   just backup-db"
    exit 0
fi

echo "📁 Backup directory: $BACKUP_DIR/"
echo "📊 Total backups: $BACKUP_COUNT"
echo ""

# List all backup files with details
echo "Available backups:"
echo "=================="
for backup in "$BACKUP_DIR"/*.bak; do
    if [ -f "$backup" ]; then
        filename=$(basename "$backup")
        size=$(du -h "$backup" | cut -f1)
        date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null || echo "Unknown")
        echo "📦 $filename"
        echo "   📏 Size: $size"
        echo "   📅 Created: $date"
        echo ""
    fi
done

echo "💡 To restore a backup, use:"
echo "   just restore-db backups/<filename>.bak" 